import React from 'react';

export const ShopLogo = ({ className }: { className?: string }) => {
  const logoSrc = window.location.hostname === 'kamalaassab.github.io' ? '/logo.png' : '/logo.png';
  
  return (
    <img
      src={logoSrc}
      alt="LOST & FOUND Logo"
      className={className ? className : "h-8 w-auto"}
      style={!className ? { maxWidth: 100, height: 32 } : undefined}
    />
  );
};
