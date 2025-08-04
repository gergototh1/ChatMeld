import { getAvatarColors, getInitials } from '../../lib/avatar';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = ({ name, size = 40 }: AvatarProps) => {
  const { background, text } = getAvatarColors(name);
  const dimension = `${size}px`;

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ backgroundColor: background, color: text, width: dimension, height: dimension }}
    >
      {getInitials(name)}
    </div>
  );
};
