import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Calendar, MessageCircle, CreditCard, Sparkles } from 'lucide-react';

interface Step4Data {
  completed: boolean;
}

interface OnboardingStep4Props {
  data: Step4Data;
  onUpdate: (data: Partial<Step4Data>) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ 
  data, 
  onUpdate, 
  onComplete, 
  onBack, 
  loading 
}) => {
  const features = [
    {
      icon: Calendar,
      title: "Manajemen Jadwal",
      description: "Kelola jadwal booking dan ketersediaan Anda dengan mudah"
    },
    {
      icon: MessageCircle,
      title: "Chat dengan Klien",
      description: "Komunikasi langsung dengan klien untuk detail pesanan"
    },
    {
      icon: CreditCard,
      title: "Pembayaran Digital",
      description: "Terima pembayaran secara digital dan aman"
    },
    {
      icon: Star,
      title: "Sistem Review",
      description: "Dapatkan review dari klien untuk meningkatkan kredibilitas"
    }
  ];

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto bg-gradient-to-r from-primary to-primary/60 rounded-full p-3 w-fit mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle>Selamat! Profil Anda Siap</CardTitle>
        <CardDescription>
          Berikut fitur-fitur yang bisa Anda manfaatkan untuk mengembangkan bisnis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Profil Lengkap!</h3>
          <p className="text-muted-foreground mb-4">
            Anda sekarang dapat mulai menerima pesanan dari klien di sekitar Anda
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-primary">✓</div>
              <div className="text-sm text-muted-foreground">Info Bisnis</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">✓</div>
              <div className="text-sm text-muted-foreground">Portofolio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">✓</div>
              <div className="text-sm text-muted-foreground">Layanan</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Kembali
          </Button>
          <Button 
            onClick={onComplete} 
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Mulai Menerima Pesanan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};