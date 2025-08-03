-- Create RPC function for booking creation
CREATE OR REPLACE FUNCTION create_new_booking(
    p_mua_profile_id UUID,
    p_service_id UUID, 
    p_booking_date DATE,
    p_booking_time TIME,
    p_total_price INTEGER,
    p_platform_fee INTEGER,
    p_customer_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id UUID;
    v_booking_id UUID;
    v_payment_id UUID;
BEGIN
    -- Get customer ID from authenticated user
    SELECT id INTO v_customer_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;
    
    -- Create booking record
    INSERT INTO bookings (
        customer_id,
        mua_profile_id, 
        service_id,
        booking_date,
        booking_time,
        total_price,
        platform_fee,
        customer_notes,
        status
    ) VALUES (
        v_customer_id,
        p_mua_profile_id,
        p_service_id,
        p_booking_date,
        p_booking_time,
        p_total_price,
        p_platform_fee,
        p_customer_notes,
        'pending'
    ) RETURNING id INTO v_booking_id;
    
    -- Create payment record
    INSERT INTO payments (
        booking_id,
        customer_id,
        amount,
        payment_status,
        payment_method
    ) VALUES (
        v_booking_id,
        v_customer_id,
        p_total_price,
        'pending',
        'bank_transfer'
    ) RETURNING id INTO v_payment_id;
    
    -- Return payment ID for redirect
    RETURN v_payment_id;
END;
$$;

-- Create function for payment confirmation with atomic transaction
CREATE OR REPLACE FUNCTION confirm_payment(
    p_payment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id UUID;
    v_booking_id UUID;
    payment_record RECORD;
BEGIN
    -- Get customer ID from authenticated user
    SELECT id INTO v_customer_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;
    
    -- Get payment details and verify ownership
    SELECT * INTO payment_record
    FROM payments 
    WHERE id = p_payment_id AND customer_id = v_customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or access denied';
    END IF;
    
    -- Check if already paid
    IF payment_record.payment_status = 'paid' THEN
        RAISE EXCEPTION 'Payment already confirmed';
    END IF;
    
    -- Update payment status atomically
    UPDATE payments 
    SET payment_status = 'paid', 
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    -- Update booking status
    UPDATE bookings 
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = payment_record.booking_id;
    
    RETURN TRUE;
END;
$$;