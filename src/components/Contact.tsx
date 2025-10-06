import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Contact = () => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const contactCards = [
		{
			icon: <Phone className="h-6 w-6" />,
			title: "Teléfono",
			content: (
				<>
					<p className="font-elegant text-foreground text-lg">Angel +52 (555) 123-4567</p>
					<p className="font-elegant text-foreground text-lg">Emiliano +52 (555) 123-4567</p>
					<p className="font-elegant text-muted-foreground text-sm mt-2">
						Llámanos para agendar tu cita
					</p>
				</>
			)
		},
		{
			icon: <MapPin className="h-6 w-6" />,
			title: "Ubicación",
			content: (
				<>
					<p className="font-elegant text-foreground">
						Av. Hidalgo 39<br />
						Col. Atequiza Centro<br />
						C.P. 45860
					</p>
					<Button 
						variant="elegant"
						size="sm" 
						className="mt-3"
						onClick={() => window.open('https://maps.app.goo.gl/aivgyU38bAkj2f6YA', '_blank')}
					>
						Ver en Google Maps
					</Button>
				</>
			)
		},
		{
			icon: <Clock className="h-6 w-6" />,
			title: "Horarios",
			content: (
				<div className="space-y-2">
					<div className="flex justify-between">
						<span className="font-elegant text-muted-foreground">Lun - Vie</span>
						<span className="font-elegant text-foreground">9:00 - 20:00</span>
					</div>
					<div className="flex justify-between">
						<span className="font-elegant text-muted-foreground">Sábados</span>
						<span className="font-elegant text-foreground">9:00 - 18:00</span>
					</div>
					<div className="flex justify-between">
						<span className="font-elegant text-muted-foreground">Domingos</span>
						<span className="font-elegant text-foreground">10:00 - 16:00</span>
					</div>
				</div>
			)
		}
	];

	return (
		<section id="contacto" className="py-24 bg-background/85 backdrop-blur-sm" ref={ref}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.h2 
						initial={{ opacity: 0, y: -30 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
						Contáctanos
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
						className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
						Estamos aquí para hacer realidad tu próximo estilo. Contáctanos y agenda tu cita.
					</motion.p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Contact Info */}
					<div className="lg:col-span-1 space-y-6">
						{contactCards.map((card, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -50 }}
								animate={inView ? { opacity: 1, x: 0 } : {}}
								transition={{ 
									duration: 0.5, 
									delay: 0.2 + index * 0.1,
									ease: "easeOut"
								}}
							>
								<Card className="glass-effect hover:border-gold/50 transition-elegant">
									<CardHeader>
										<CardTitle className="font-display text-xl text-gold flex items-center space-x-3">
											{card.icon}
											<span>{card.title}</span>
										</CardTitle>
									</CardHeader>
									<CardContent>
										{card.content}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{/* Interactive Map */}
					<motion.div 
						className="lg:col-span-2"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={inView ? { opacity: 1, scale: 1 } : {}}
						transition={{ 
							duration: 0.6, 
							delay: 0.3,
							ease: "easeOut"
						}}
					>
						<Card className="glass-effect h-full">
							<CardContent className="p-0 h-full min-h-[400px]">
								<iframe
									src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.707378183242!2d-103.1362642!3d20.3949516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842f396d72800ef3%3A0x33866592b8d0bc85!2sCantaBarba%20Studio!5e0!3m2!1ses-419!2smx!4v1758430356852!5m2!1ses-419!2smx"
									width="100%"
									height="100%"
									style={{ border: 0, borderRadius: '0.75rem' }}
									allowFullScreen
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									title="CantaBarba Studio Location"
								/>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Social Media */}
				<motion.div 
					className="mt-16 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
				>
					<h3 className="font-display text-2xl text-gold mb-6">Síguenos en Redes</h3>
					<TooltipProvider>
						<div className="flex justify-center space-x-6">
							{[
								{ href: 'https://www.facebook.com/Ramirezlpb', tooltip: 'Facebook Angel: Ramirezlpb', icon: <Facebook className="h-6 w-6" /> },
								{ href: 'https://www.instagram.com/cantabarba_studio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', tooltip: 'Instagram: cantabarba_studio', icon: <Instagram className="h-6 w-6" /> },
								{ href: 'https://www.facebook.com/emiliano.vega.1806253', tooltip: 'Facebook Emiliano: emiliano.vega.1806253', icon: <Facebook className="h-6 w-6" /> }
							].map((social, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={inView ? { opacity: 1, scale: 1 } : {}}
									transition={{ 
										duration: 0.4, 
										delay: 0.6 + index * 0.1,
										ease: "easeOut"
									}}
									whileHover={{ scale: 1.15 }}
								>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button 
												variant="elegant"
												size="lg" 
												className="p-4"
												onClick={() => window.open(social.href, '_blank')}
											>
												{social.icon}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{social.tooltip}
										</TooltipContent>
									</Tooltip>
								</motion.div>
							))}
						</div>
					</TooltipProvider>
				</motion.div>
			</div>
		</section>
	);
};

export default Contact;