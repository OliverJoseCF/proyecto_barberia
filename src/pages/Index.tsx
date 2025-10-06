import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";

// Lazy load de componentes que no están en el viewport inicial
const Services = lazy(() => import("@/components/Services"));
const Gallery = lazy(() => import("@/components/Gallery"));
const Team = lazy(() => import("@/components/Team"));
const Contact = lazy(() => import("@/components/Contact"));
const Booking = lazy(() => import("@/components/Booking"));
const Recommendations = lazy(() => import("@/components/Recommendations"));

// Componente de loading para Suspense
const LoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-pulse text-gold text-xl font-elegant">Cargando...</div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Suspense fallback={<LoadingFallback />}>
        <Services />
        <Gallery />
        <Team />
        <Contact />
        <Recommendations />
        <Booking />
      </Suspense>
    </div>
  );
};

export default Index;
