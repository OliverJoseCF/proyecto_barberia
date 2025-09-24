import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Booking from "@/components/Booking";
import Recommendations from "@/components/Recommendations";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Services />
      <Gallery />
      <Team />
      <Contact />
      <Recommendations />
      <Booking />
    </div>
  );
};

export default Index;
