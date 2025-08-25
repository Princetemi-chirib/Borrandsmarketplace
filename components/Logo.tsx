import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <Image
          src="/images/brand-logo.jpeg"
          alt="Borrands Marketplace"
          fill
          className="object-contain rounded-lg"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold text-brand-primary ${textSizes[size]}`}>
          Borrands
        </span>
      )}
    </Link>
  );
}
