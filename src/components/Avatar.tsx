import { User } from 'lucide-react';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 40, className = '' }: AvatarProps) {
  // Generate a color based on the name
  const getColorFromName = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Get initials from name
  const getInitials = (str: string): string => {
    const words = str.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-accent-purple text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4
      }}
      role="img"
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
}
