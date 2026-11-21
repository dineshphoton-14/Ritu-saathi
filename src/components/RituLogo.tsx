import React, {useState} from 'react';
import {Sparkles} from 'lucide-react';

export const RituLogo: React.FC<{compact?: boolean}> = ({compact = false}) => {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#DB2777] text-white shadow-xs"
        aria-hidden="true"
      >
        <svg viewBox="0 0 36 36" className="h-5 w-5" fill="none">
          <path
            d="M18 6C15.5 11.2 14.8 15.8 18 21.5C21.2 15.8 20.5 11.2 18 6Z"
            fill="currentColor"
          />
          <path
            d="M18 21.5C12.8 19.9 9.2 16 8.6 11.6C12.9 12.6 16.2 16.1 18 21.5Z"
            fill="currentColor"
            fillOpacity="0.86"
          />
          <path
            d="M18 21.5C23.2 19.9 26.8 16 27.4 11.6C23.1 12.6 19.8 16.1 18 21.5Z"
            fill="currentColor"
            fillOpacity="0.86"
          />
          <path
            d="M11.5 26.8C15.1 29.1 20.9 29.1 24.5 26.8"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-[#221830] whitespace-nowrap">
          RituSaathi
        </span>
      )}
    </div>
  );
};

export const WellnessImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}> = ({src, alt, className = '', fallbackTitle}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F3EEF9] via-[#FDF2F8] to-[#EDE9FE] p-6 text-center text-[#5B21B6] ${className}`}
      >
        <Sparkles className="h-6 w-6 opacity-75" />
        <span className="text-xs font-medium">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
