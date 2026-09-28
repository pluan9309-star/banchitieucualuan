import React from 'react';
import {
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  Award,
  Laptop,
  TrendingUp,
  Gift,
  ShieldCheck,
  Plane,
  Tag,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', style }) => {
  const iconProps = { className, style };

  switch (name) {
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Wallet':
      return <Wallet {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'Plane':
      return <Plane {...iconProps} />;
    case 'PiggyBank':
      return <PiggyBank {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'MoreHorizontal':
    default:
      return <Tag {...iconProps} />;
  }
};
