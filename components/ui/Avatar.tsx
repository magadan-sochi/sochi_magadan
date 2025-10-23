
import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Avatar: React.FC<AvatarProps> = ({ className, ...props }) => (
  <span
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  />
);

const AvatarImage: React.FC<AvatarImageProps> = ({ className, ...props }) => (
  <img
    className={`aspect-square h-full w-full ${className}`}
    {...props}
  />
);

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <span
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
    {...props}
  >
    {children}
  </span>
);

export { Avatar, AvatarImage, AvatarFallback };
