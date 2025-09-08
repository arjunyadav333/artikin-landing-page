import { Button } from '@/components/ui/button';
import { Plus, LucideIcon } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function AddButton({ 
  onClick, 
  label, 
  icon: Icon = Plus, 
  size = 'md',
  variant = 'outline'
}: AddButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 p-0',
    md: 'h-9 px-3',
    lg: 'h-10 px-4'
  };

  if (!label) {
    return (
      <Button
        onClick={onClick}
        variant={variant}
        size="icon"
        className={`${sizeClasses[size]} rounded-2xl shadow-sm hover:shadow-md transition-shadow`}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`${sizeClasses[size]} rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-2`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}