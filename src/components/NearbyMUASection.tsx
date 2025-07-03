import MUACard from "./MUACard";

const NearbyMUASection = () => {
  const nearbyMUAs = [
    {
      name: "Sarah Makeup Artist",
      rating: 4.8,
      reviews: 127,
      location: "Kemang",
      distance: "2.5 km",
      specialty: "Bridal & Party Makeup",
      price: "Rp 300.000"
    },
    {
      name: "Maya Beauty Studio",
      rating: 4.9,
      reviews: 89,
      location: "Pondok Indah",
      distance: "3.1 km",
      specialty: "Korean & Natural Look",
      price: "Rp 250.000"
    },
    {
      name: "Dinda MUA",
      rating: 4.7,
      reviews: 156,
      location: "Cipete",
      distance: "1.8 km",
      specialty: "Graduation & Photoshoot",
      price: "Rp 200.000"
    },
    {
      name: "Rika Professional",
      rating: 4.9,
      reviews: 203,
      location: "Senayan",
      distance: "4.2 km",
      specialty: "Editorial & Fashion",
      price: "Rp 400.000"
    }
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          MUA yang Dekat Dengan Anda
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyMUAs.map((mua, index) => (
            <MUACard key={index} {...mua} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NearbyMUASection;