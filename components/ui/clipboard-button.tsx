import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClipboardButtonProps {
  text: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onCopy?: () => void;
  label?: string;
}

export function ClipboardButton({
  text,
  variant = 'outline',
  size = 'icon',
  className,
  onCopy,
  label = '복사',
}: ClipboardButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      onCopy?.();

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        'relative transition-all duration-200',
        isCopied && 'bg-green-50 text-green-600 border-green-200',
        className
      )}
      title={label}
    >
      {isCopied ? (
        <Check className="h-4 w-4 transition-transform duration-200 animate-in zoom-in-50" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {size !== 'icon' && <span className="ml-2">{label}</span>}
    </Button>
  );
} 