import React, { useState } from 'react';

export const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
  ...props
}) => {
  const [error, setError] = useState(false);

  return (
    <img
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};
