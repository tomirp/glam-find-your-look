import { Card, CardContent } from "@/components/ui/card";

const CategorySection = () => {
  const categories = [
    {
      title: "Bridal Makeup",
      description: "Makeup pengantin yang elegan dan tahan lama",
      bgColor: "bg-gradient-to-br from-primary/30 to-secondary/40"
    },
    {
      title: "Party Makeup",
      description: "Glam look untuk acara pesta dan event",
      bgColor: "bg-gradient-to-br from-secondary/30 to-accent/40"
    },
    {
      title: "Natural Look",
      description: "Makeup natural untuk daily & professional",
      bgColor: "bg-gradient-to-br from-accent/30 to-primary/30"
    },
    {
      title: "Photoshoot",
      description: "Makeup editorial untuk sesi foto profesional",
      bgColor: "bg-gradient-to-br from-primary/20 to-secondary/30"
    },
    {
      title: "Graduation",
      description: "Makeup wisuda yang anggun dan fotogenic",
      bgColor: "bg-gradient-to-br from-secondary/20 to-accent/30"
    },
    {
      title: "Korean Style",
      description: "K-beauty inspired makeup dengan hasil fresh",
      bgColor: "bg-gradient-to-br from-accent/20 to-primary/40"
    }
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          Telusuri Kategori Jasa
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all cursor-pointer border-border group hover:scale-105"
            >
              <CardContent className="p-0 relative overflow-hidden rounded-lg">
                <div className={`h-48 ${category.bgColor} flex items-end relative`}>
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 p-6 text-white w-full">
                    <h3 className="text-xl font-bold mb-2 font-heading">
                      {category.title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;