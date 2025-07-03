import { Card, CardContent } from "@/components/ui/card";

const BrandSection = () => {
  const brands = [
    { name: "MAC", logo: "MAC" },
    { name: "Urban Decay", logo: "UD" },
    { name: "Fenty Beauty", logo: "FB" },
    { name: "Rare Beauty", logo: "RB" },
    { name: "Charlotte Tilbury", logo: "CT" },
    { name: "Dior", logo: "DIOR" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          Brand Pilihan Kami
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-border">
              <CardContent className="p-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{brand.logo}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSection;