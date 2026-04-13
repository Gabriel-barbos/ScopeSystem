import { motion } from "framer-motion";
import { type ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  index?: number;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export function AnimatedSection({ children, index = 0 }: AnimatedSectionProps) {
  return (
    <motion.section
      className="space-y-3"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      {children}
    </motion.section>
  );
}