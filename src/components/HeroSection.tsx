import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Temukan MUA Terbaik di Sekitar Anda",
      subtitle: "Dapatkan layanan makeup profesional dengan mudah",
      buttonText: "Jelajahi Sekarang",
      bgColor: "bg-gradient-to-r from-primary/20 to-secondary/30"
    },
    {
      id: 2,
      title: "Promo Spesial untuk Pengguna Baru",
      subtitle: "Diskon 30% untuk booking pertama Anda",
      buttonText: "Dapatkan Promo",
      bgColor: "bg-gradient-to-r from-secondary/30 to-accent/40"
    },
    {
      id: 3,
      title: "Bergabung Sebagai MUA Partner",
      subtitle: "Kembangkan bisnis makeup Anda bersama kami",
      buttonText: "Daftar Sekarang",
      bgColor: "bg-gradient-to-r from-accent/30 to-primary/20"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-80 md:h-96 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          } ${slide.bgColor} flex items-center justify-center`}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-heading">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {slide.subtitle}
            </p>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              {slide.buttonText}
            </Button>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-background/60"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;