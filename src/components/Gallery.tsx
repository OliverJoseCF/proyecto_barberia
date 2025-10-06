import gallery1 from "@/assets/corte1.jpg";
import gallery2 from "@/assets/corte1.jpg";
import gallery3 from "@/assets/angel.jpg";
import { Carousel } from "./Carousel";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Gallery = () => {


	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const carouselSlides = [
		{
			src: gallery1,
			title: "Corte Gey",
			button: "Ver Más Trabajos"
		},
		{
			src: gallery2,
			title: "Barba Profesional",
			button: "Reservar Cita"
		},
		{
			src: gallery3,
			title: "Afeitado Clásico",
			button: "Conocer Servicios"
		},
		{
			src: gallery1,
			title: "Estilo Personalizado",
			button: "Ver Portfolio"
		},
		{
			src: gallery3,
			title: "Técnicas Avanzadas",
			button: "Agendar Ahora"
		}
		


	];

	return (
		<section id="galeria" className="py-24 bg-background/85 backdrop-blur-sm" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.h2 
						initial={{ opacity: 0, scale: 0.9 }}
						animate={inView ? { opacity: 1, scale: 1 } : {}}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
						Nuestro Trabajo
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
						className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
						Cada cliente es una obra de arte. Descubre la excelencia en cada detalle.
					</motion.p>
				</div>

				<motion.div 
					className="w-full flex justify-center overflow-hidden"
					initial={{ opacity: 0, y: 50 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
				>
					<Carousel slides={carouselSlides} />
				</motion.div>

				<motion.div 
					className="text-center mt-12"
					initial={{ opacity: 0 }}
					animate={inView ? { opacity: 1 } : {}}
					transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
				>
					<p className="font-elegant text-lg text-muted-foreground italic">
						"Cada corte cuenta una historia, cada barba refleja personalidad"
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default Gallery;