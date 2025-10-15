import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { AnimatedElement, FloatingParticles } from "@/components/ui/animations";
import { useSEO } from "@/hooks/use-seo";

// Lazy load de componentes que no están en el viewport inicial
const Services = lazy(() => import("@/components/Services"));
const Gallery = lazy(() => import("@/components/Gallery"));
const Team = lazy(() => import("@/components/Team"));
const Contact = lazy(() => import("@/components/Contact"));
const Booking = lazy(() => import("@/components/Booking"));
const Recommendations = lazy(() => import("@/components/Recommendations"));
const InstallPrompt = lazy(() => import("@/components/InstallPrompt"));

// Componente de loading para Suspense
const LoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-pulse text-gold text-xl font-elegant">Cargando...</div>
  </div>
);

const Index = () => {
  // SEO para la página principal
  useSEO({
    title: "CantaBarba Studio - Barbería Tradicional | Cortes Profesionales",
    description: "Barbería tradicional desde 1995. Cortes profesionales, afeitado clásico y estilo único. Agenda tu cita en CantaBarba Studio.",
    keywords: "barbería, cortes de cabello, afeitado, estilo masculino, tradición, profesional",
  image: "/assets/logo1.jpg"
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles count={8} />
      
      <Navigation />
      <Hero />
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedElement variant="slideInUp">
          <Services />
        </AnimatedElement>
        
        <AnimatedElement variant="slideInLeft" delay={0.2}>
          <Gallery />
        </AnimatedElement>
        
        <AnimatedElement variant="slideInRight" delay={0.3}>
          <Team />
        </AnimatedElement>
        
        <AnimatedElement variant="slideInUp" delay={0.4}>
          <Contact />
        </AnimatedElement>
        
        <AnimatedElement variant="scaleIn" delay={0.5}>
          <Recommendations />
        </AnimatedElement>
        
        <AnimatedElement variant="slideInUp" delay={0.6}>
          <Booking />
        </AnimatedElement>
        
        <InstallPrompt />
      </Suspense>
    </div>
  );
};

export default Index;
