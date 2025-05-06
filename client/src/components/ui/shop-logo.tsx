import React from 'react';

export const ShopLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="30"
        fontFamily="Montserrat, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="currentColor"
      >
        LOST & FOUND
      </text>
    </svg>
  );
};
