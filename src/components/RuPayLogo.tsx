import React from 'react';

interface RuPayLogoProps {
  size?: 'md' | 'lg';
}

export const RuPayLogo: React.FC<RuPayLogoProps> = ({ size = 'lg' }) => {
  const isLarge = size === 'lg';

  return (
    <div className="inline-flex flex-col items-center select-none">
      {/* RuPay Wordmark + Chevron Lockup */}
      <div className="inline-flex items-center gap-0.5">
        <span
          className={`font-extrabold italic tracking-tight text-white leading-none ${
            isLarge ? 'text-2xl sm:text-[26px]' : 'text-xl'
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          RuPay
        </span>
        <svg
          width={isLarge ? '18' : '14'}
          height={isLarge ? '18' : '14'}
          viewBox="0 0 24 24"
          fill="none"
          className="ml-0.5 -mt-0.5"
          aria-hidden="true"
        >
          {/* Orange Chevron */}
          <path d="M4 3L13 12L4 21L7.5 21L16.5 12L7.5 3H4Z" fill="#F37021" />
          {/* Green Chevron */}
          <path d="M11 3L20 12L11 21L14.5 21L23.5 12L14.5 3H11Z" fill="#009B4D" />
        </svg>
      </div>

      {/* "Own the edge" Script Overlay */}
      <div
        className={`font-script text-white/95 leading-none -mt-2 tracking-wide ${
          isLarge ? 'text-[32px] sm:text-[36px]' : 'text-[26px]'
        }`}
        style={{
          textShadow: '0 2px 12px rgba(0, 140, 255, 0.55)',
          transform: 'rotate(-3deg)',
        }}
      >
        Own the edge
      </div>
    </div>
  );
};
