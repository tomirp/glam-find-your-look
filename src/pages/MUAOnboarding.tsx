import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingStepper } from "@/components/MUAOnboarding/OnboardingStepper";
import { OnboardingStep1 } from "@/components/MUAOnboarding/OnboardingStep1";
import { OnboardingStep2 } from "@/components/MUAOnboarding/OnboardingStep2";
import { OnboardingStep3 } from "@/components/MUAOnboarding/OnboardingStep3";
import { OnboardingStep4 } from "@/components/MUAOnboarding/OnboardingStep4";

const MUAOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [step1Data, setStep1Data] = useState({
    business_name: "",
    location_city: "",
    location_address: "",
    whatsapp_number: "",
    specializations: "",
    price_range: "",
    instagram_url: "",
  });

  const [step2Data, setStep2Data] = useState({
    portfolio_images: [],
    cover_image_url: "",
    bio: "",
  });

  const [step3Data, setStep3Data] = useState({
    services: [],
  });

  const [step4Data, setStep4Data] = useState({
    completed: false,
  });

  const steps = [
    { title: "Info Bisnis", description: "Detail dasar bisnis Anda" },
    { title: "Portofolio", description: "Showcase karya terbaik" },
    { title: "Layanan", description: "Atur layanan & harga" },
    { title: "Selesai", description: "Profil siap digunakan" }
  ];

  const handleComplete = async () => {
    if (!user) {
      toast({ title: "Error", description: "Anda harus masuk untuk melanjutkan.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Update profile with bio
      if (step2Data.bio) {
        await supabase
          .from('profiles')
          .update({ bio: step2Data.bio })
          .eq('id', profile.id);
      }

      // Create MUA profile
      const { data: muaProfile, error: muaError } = await supabase
        .from("mua_profiles")
        .insert({
          profile_id: profile.id,
          business_name: step1Data.business_name,
          location_city: step1Data.location_city,
          location_address: step1Data.location_address,
          specializations: step1Data.specializations.split(",").map(s => s.trim()),
          price_range: step1Data.price_range,
          instagram_url: step1Data.instagram_url,
          whatsapp_number: step1Data.whatsapp_number,
          portfolio_images: step2Data.portfolio_images,
          cover_image_url: step2Data.cover_image_url,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (muaError) throw muaError;

      // Create services
      if (step3Data.services.length > 0) {
        const servicesData = step3Data.services.map(service => ({
          mua_profile_id: muaProfile.id,
          name: service.name,
          description: service.description,
          price_min: service.price_min,
          price_max: service.price_max || service.price_min,
          duration_minutes: service.duration_minutes,
          image_url: service.image_url,
          is_active: true,
        }));

        const { error: servicesError } = await supabase
          .from("services")
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      toast({ 
        title: "Selamat!", 
        description: "Profil MUA Anda telah berhasil dibuat dan siap menerima pesanan!" 
      });
      
      navigate("/mua/profile");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            data={step1Data}
            onUpdate={(data) => setStep1Data(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            data={step2Data}
            onUpdate={(data) => setStep2Data(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            data={step3Data}
            onUpdate={(data) => setStep3Data(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            data={step4Data}
            onUpdate={(data) => setStep4Data(prev => ({ ...prev, ...data }))}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(3)}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <OnboardingStepper 
          currentStep={currentStep} 
          totalSteps={4} 
          steps={steps}
        />
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default MUAOnboarding;