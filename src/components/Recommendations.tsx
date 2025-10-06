import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Phone, Calendar, Scissors, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Recommendations = () => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const recommendations = [
		{
			icon: <Clock className="h-6 w-6" />,
			title: "Llega 10 minutos antes",
			description: "Te recomendamos llegar con anticipación para relajarte y disfrutar de la experiencia completa."
		},
		{
			icon: <Phone className="h-6 w-6" />,
			title: "Confirma tu cita",
			description: "Llama un día antes para confirmar tu reserva y evitar cualquier inconveniente."
		},
		{
			icon: <Calendar className="h-6 w-6" />,
			title: "Cancela con 24h de anticipación",
			description: "Si necesitas cancelar, hazlo con al menos 24 horas de anticipación para dar oportunidad a otros clientes."
		},
		{
			icon: <Scissors className="h-6 w-6" />,
			title: "Trae referencias visuales",
			description: "Si tienes un corte específico en mente, trae fotos de referencia para mejores resultados."
		},
		{
			icon: <CheckCircle className="h-6 w-6" />,
			title: "Cabello limpio",
			description: "Ven con el cabello limpio, esto facilita el trabajo y permite mejores resultados."
		},
		{
			icon: <AlertCircle className="h-6 w-6" />,
			title: "Comunica alergias",
			description: "Informa sobre cualquier alergia a productos o tratamientos antes de iniciar el servicio."
		}
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut"
			},
		},
	};

	return (
	<section id="recomendaciones" className="py-24 bg-section-bg/80 backdrop-blur-sm border-elegant-border/30" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.h2 
						initial={{ opacity: 0, y: -30 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
						Recomendaciones para tu Cita
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
						className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
						Para garantizar la mejor experiencia y resultados excepcionales
					</motion.p>
				</div>

				<motion.div 
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
				>
					{recommendations.map((rec, index) => (
						<motion.div key={index} variants={itemVariants}>
							<Card className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant group bg-card/40 backdrop-blur-lg h-full">
								<CardHeader className="text-center">
									<motion.div 
										className="mx-auto w-12 h-12 gradient-gold rounded-full flex items-center justify-center mb-4 glow-soft"
										whileHover={{ rotate: 360, scale: 1.1 }}
										transition={{ duration: 0.5, ease: "easeInOut" }}
									>
										<div className="text-gold-foreground">
											{rec.icon}
										</div>
									</motion.div>
									<CardTitle className="font-display text-lg text-foreground">
										{rec.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<p className="font-elegant text-sm text-muted-foreground leading-relaxed">
										{rec.description}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default Recommendations;