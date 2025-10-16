import { Carousel } from "./Carousel";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useGaleria } from "@/hooks/use-galeria";
import { Loader2, ImageIcon } from "lucide-react";
import { useState } from "react";

const Gallery = () => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	// Solo imágenes activas para la página pública
	const { imagenes, loading } = useGaleria(false);
	const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');

	// Filtrar imágenes por categoría
	const imagenesFiltradas = categoriaFiltro === 'todas' 
		? imagenes 
		: imagenes.filter(img => img.categoria === categoriaFiltro);

	// Convertir imágenes a formato del Carousel
	const carouselSlides = imagenesFiltradas.map(img => ({
		src: img.imagen_url,
		title: img.titulo,
		button: img.categoria ? `Ver más ${img.categoria}` : "Ver Más Trabajos"
	}));

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
					{loading ? (
						<div className="flex justify-center items-center py-20">
							<Loader2 className="h-8 w-8 animate-spin text-gold" />
						</div>
					) : carouselSlides.length === 0 ? (
						<div className="text-center py-20">
							<ImageIcon className="h-16 w-16 text-gold/50 mx-auto mb-4" />
							<p className="text-muted-foreground text-lg">No hay imágenes disponibles en la galería</p>
						</div>
					) : (
						<Carousel slides={carouselSlides} />
					)}
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