import { motion, useAnimation, useInView, Variants, Easing } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Variantes de animaciones predefinidas
export const ANIMATION_VARIANTS: { [key: string]: Variants } = {
  // Animaciones de entrada
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  slideInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  slideInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  },

  // Animaciones de container para stagger
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
  },

  // Animaciones de hover
  buttonHover: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05, 
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 0.2, 1]
      } 
    },
    tap: { scale: 0.95 }
  },

  cardHover: {
    rest: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    hover: { 
      y: -8, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1]
      } 
    }
  },

  // Animaciones de loading
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear" as Easing
      }
    }
  },

  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Animaciones de texto
  typewriter: {
    hidden: { width: 0 },
    visible: {
      width: "auto",
      transition: {
        duration: 2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }
};

// Hook personalizado para animaciones con Intersection Observer
interface UseAnimatedInViewProps {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export const useAnimatedInView = ({ 
  threshold = 0.1, 
  triggerOnce = true, 
  rootMargin = "0px" 
}: UseAnimatedInViewProps = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: triggerOnce, 
    margin: rootMargin as `${number}px` 
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!triggerOnce) {
      controls.start("hidden");
    }
  }, [controls, isInView, triggerOnce]);

  return { ref, controls, isInView };
};

// Componente wrapper para animaciones simples
interface AnimatedElementProps {
  children: React.ReactNode;
  variant?: keyof typeof ANIMATION_VARIANTS;
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
  threshold?: number;
}

export const AnimatedElement = ({
  children,
  variant = 'fadeIn',
  delay = 0,
  duration,
  className = '',
  triggerOnce = true,
  threshold = 0.1
}: AnimatedElementProps) => {
  const { ref, controls } = useAnimatedInView({ threshold, triggerOnce });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={ANIMATION_VARIANTS[variant]}
      transition={{
        delay,
        duration: duration || 0.6,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Componente para animaciones de texto letra por letra
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export const AnimatedText = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.05
}: AnimatedTextProps) => {
  const { ref, controls } = useAnimatedInView();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay,
      }
    }
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Componente para animaciones de contador
interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({
  from = 0,
  to,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) => {
  const { ref, isInView } = useAnimatedInView({ threshold: 0.3 });
  const [currentValue, setCurrentValue] = useState(from);

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const startValue = from;
      const endValue = to;
      const animationDuration = duration * 1000;

      const updateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Función de easing
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const value = startValue + (endValue - startValue) * easeProgress;
        setCurrentValue(value);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      requestAnimationFrame(updateValue);
    }
  }, [isInView, from, to, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{currentValue.toFixed(decimals)}{suffix}
    </motion.span>
  );
};

// Hook para animaciones de página
export const usePageTransition = () => {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    out: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };

  return pageVariants;
};

// Animación de partículas flotantes para backgrounds
export const FloatingParticles = ({ count = 6 }: { count?: number }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gold/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};