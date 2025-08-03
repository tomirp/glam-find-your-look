// src/components/LoginNotificationPopup.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

type Notification = {
    id: number;
    message: string;
    link: string | null;
};

export const LoginNotificationPopup = () => {
    const { user } = useAuth();
    const [notification, setNotification] = useState<Notification | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const fetchUnreadNotification = async () => {
                const { data } = await supabase
                    .from('notifications')
                    .select('id, message, link')
                    .eq('user_id', user.id)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setNotification(data);
                }
            };
            const initialFetchTimeout = setTimeout(fetchUnreadNotification, 1500);
            return () => clearTimeout(initialFetchTimeout);
        }
    }, [user]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = async (markAsRead = true) => {
        if (markAsRead && notification) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id);
        }
        setNotification(null);
    };

    const handleNavigate = () => {
        if (notification?.link) {
            navigate(notification.link);
        }
        handleClose();
    };

    if (!notification) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <Card className="w-[350px] shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-lg">
                        Notifikasi Baru
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleClose()}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleClose()}>Mengerti</Button>
                    <Button onClick={handleNavigate}>Lihat Detail</Button>
                </CardFooter>
            </Card>
        </div>
    );
};