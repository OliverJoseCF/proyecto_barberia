/**
 * Sistema de Animaciones Consistente para Admin Pages
 * Versión simplificada y profesional - CantaBarba Studio
 */

import { Variants } from 'framer-motion';

// ============================================
// ANIMACIONES DE ENTRADA (Page Entry)
// ============================================

export const pageHeaderAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export const pageContentAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// ============================================
// ANIMACIONES DE CARDS
// ============================================

export const cardHoverAnimation = {
  y: -5,
  transition: { duration: 0.2 }
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

// ============================================
// ANIMACIONES DE BOTONES
// ============================================

export const buttonHoverAnimation = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const buttonTapAnimation = {
  scale: 0.95,
  transition: { duration: 0.15 }
};

// ============================================
// ANIMACIONES DE NAVEGACIÓN
// ============================================

export const backButtonAnimation = {
  whileHover: { x: -5, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 }
};

// ============================================
// ANIMACIONES DE LISTA (Stagger)
// ============================================

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

// ============================================
// CLASES CSS REUTILIZABLES
// ============================================

export const glassEffectClasses = 'glass-effect border-gold/20';
export const hoverBorderClasses = 'hover:border-gold/30 transition-colors duration-200';

// ============================================
// UTILIDADES PARA DELAYS
// ============================================

export const getStaggerDelay = (index: number, baseDelay = 0.05) => index * baseDelay;
export const getEntranceDelay = (section: number) => section * 0.2;
