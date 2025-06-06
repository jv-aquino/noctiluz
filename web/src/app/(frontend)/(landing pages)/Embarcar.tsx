'use client';

import Link from 'next/link';
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useRef } from 'react';

function Embarcar({ isLogged }: { isLogged: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Tilt and scale
  const rotateX = useTransform(y, [-300, 300], [9, -9]);
  const rotateY = useTransform(x, [-300, 300], [-9, 9]);

  const distance = useTransform([x, y], ([latestX, latestY]: number[]) => {
    return Math.sqrt(latestX ** 2 + latestY ** 2);
  });

  const hoverScale = useTransform(distance, [0, 250], [1, 0.93]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        className="mx-auto text-center w-max"
      >
        <m.div
          ref={ref}
          style={{
            rotateX,
            rotateY,
            scale: hoverScale,
            transformStyle: 'preserve-3d',
          }}
          className="perspective-1000"
        >
          <Link
            href={isLogged ? '/aprender' : '/cadastro'}
            className="text-pink-50 text-4xl button-lg border-pink-200 bg-pink-500 colorTransition hover:bg-pink-400"
          >
            {isLogged ? 'Continue Aprendendo' : 'Embarque agora'}
          </Link>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default Embarcar;
