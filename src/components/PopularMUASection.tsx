import MUACard from "./MUACard";

const PopularMUASection = () => {
  const popularMUAs = [
    {
      name: "Luna Beauty Expert",
      rating: 5.0,
      reviews: 342,
      location: "Menteng",
      distance: "5.2 km",
      specialty: "Celebrity & Red Carpet",
      price: "Rp 800.000",
      isPopular: true
    },
    {
      name: "Aesthetic by Vina",
      rating: 4.9,
      reviews: 289,
      location: "Kelapa Gading",
      distance: "7.8 km",
      specialty: "Bridal & Pre-wedding",
      price: "Rp 600.000",
      isPopular: true
    },
    {
      name: "Glam Studio Jakarta",
      rating: 4.8,
      reviews: 445,
      location: "PIK",
      distance: "12.3 km",
      specialty: "Party & Event Makeup",
      price: "Rp 350.000",
      isPopular: true
    },
    {
      name: "Beauty by Andira",
      rating: 4.9,
      reviews: 178,
      location: "Bintaro",
      distance: "8.5 km",
      specialty: "Natural & Soft Glam",
      price: "Rp 275.000",
      isPopular: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          Jasa Make-Up Populer
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularMUAs.map((mua, index) => (
            <MUACard key={index} {...mua} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularMUASection;