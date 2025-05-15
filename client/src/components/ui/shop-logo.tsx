import React from 'react';

export const ShopLogo = ({ className }: { className?: string }) => {
  return (
    <img
      src="/logo.png"
      alt="LOST & FOUND Logo"
      className={className ? className : "h-8 w-auto"}
      style={!className ? { maxWidth: 100, height: 32 } : undefined}
    />
  );
};
