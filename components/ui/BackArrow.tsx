'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackArrowProps {
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function BackArrow({ href, className = '', onClick }: BackArrowProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700" />
    </motion.button>
  );
}

