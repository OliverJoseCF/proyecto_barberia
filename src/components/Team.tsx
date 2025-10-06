import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Heart } from "lucide-react";
import angelImage from "@/assets/angel.jpg";
import marcoImage from "@/assets/emiliano.jpg";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CardContainer, CardBody, CardItem } from "@/components/3d-card";

const Team = () => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const teamMembers = [
		{
			name: "Ángel Ramírez",
			title: "Fundador & Master Barber",
			slogan: "La perfección está en los detalles",
			specialization: "Especialista en cortes clásicos y modernos",
			experience: "8+ años de experiencia",
			personality: "Apasionado por el arte de la barbería, combina técnicas tradicionales con tendencias modernas. Su filosofía: cada cliente merece una experiencia única.",
			image: angelImage
		},
		{
			name: "Emiliano Vega",
			title: "Senior Barber",
			slogan: "El estilo es una forma de expresión",
			specialization: "Experto en diseños capilares y coloración",
			experience: "5+ años de experiencia",
			personality: "Creativo y detallista, se especializa en transformaciones audaces. Su pasión por el arte se refleja en cada corte que realiza.",
			image: marcoImage
		}
	];

	return (
		<section id="equipo" className="py-24 bg-section-bg/80 backdrop-blur-sm" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-0">
					<motion.h2 
						initial={{ opacity: 0, x: -50 }}
						animate={inView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
						Nuestro Equipo
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0, x: 50 }}
						animate={inView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
						className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
						Artistas dedicados que transforman tu visión en realidad
					</motion.p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
					{teamMembers.map((member, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50, scale: 0.95 }}
							animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
							transition={{ 
								duration: 0.5, 
								delay: index * 0.15,
								ease: "easeOut"
							}}
						>
							<CardContainer className="inter-var py-0">
								<CardBody className="relative group/card hover:shadow-2xl hover:shadow-gold/[0.1] bg-black/40 border-elegant-border/30 w-auto sm:w-[30rem] h-auto rounded-xl p-6 border min-h-0">
									<CardItem
										translateZ="50"
										className="text-center w-full"
									>
										<motion.div 
											className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gold/30"
											whileHover={{ scale: 1.1 }}
											transition={{ duration: 0.3, ease: "easeOut" }}
										>
											<img 
												src={member.image} 
												alt={`${member.name} - ${member.title}`}
												className="w-full h-full object-cover"
											/>
										</motion.div>
									</CardItem>
									
									<CardItem
										translateZ="60"
										className="text-center w-full"
									>
										<h3 className="font-display text-2xl text-foreground mb-2">
											{member.name}
										</h3>
									</CardItem>
									
									<CardItem
										translateZ="40"
										className="text-center w-full mb-2"
									>
										<p className="font-elegant text-gold text-lg">
											{member.title}
										</p>
									</CardItem>
									
									<CardItem
										translateZ="30"
										className="text-center w-full mb-6"
									>
										<p className="font-elegant text-gold italic text-sm">
											"{member.slogan}"
										</p>
									</CardItem>
									
									<CardItem
										translateZ="80"
										className="w-full space-y-4"
									>
										<div className="space-y-3">
											<div className="flex items-start space-x-3">
												<Heart className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
												<div>
													<p className="font-elegant font-semibold text-foreground text-sm">Especialización</p>
													<p className="font-elegant text-muted-foreground text-sm">{member.specialization}</p>
												</div>
											</div>
											
											<div className="flex items-start space-x-3">
												<Star className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
												<div>
													<p className="font-elegant font-semibold text-foreground text-sm">Experiencia</p>
													<p className="font-elegant text-muted-foreground text-sm">{member.experience}</p>
												</div>
											</div>
										</div>
										
										<div className="pt-4 border-t border-elegant-border/30">
											<p className="font-elegant text-muted-foreground text-sm leading-relaxed">
												{member.personality}
											</p>
										</div>
									</CardItem>
								</CardBody>
							</CardContainer>
						</motion.div>
					))}
				</div>

				<motion.div 
					className="text-center mt-0"
					initial={{ opacity: 0, y: 30 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
				>
					<p className="font-elegant text-lg text-muted-foreground italic max-w-3xl mx-auto">
						"En CantaBarba Studio, no solo cortamos cabello. Creamos experiencias únicas 
						donde el arte, la técnica y la pasión se combinan para realzar tu personalidad."
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default Team;