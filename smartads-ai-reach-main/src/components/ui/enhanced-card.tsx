import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient' | 'outline';
  hover?: boolean;
  children?: React.ReactNode;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  className,
  variant = 'default',
  hover = true,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    elevated: 'bg-card text-card-foreground shadow-lg',
    gradient: 'bg-gradient-subtle text-card-foreground shadow-md',
    outline: 'border-2 border-primary/20 bg-card text-card-foreground',
  };

  const hoverStyles = hover 
    ? 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]' 
    : '';

  return (
    <Card
      className={cn(
        'border-0',
        variantStyles[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};