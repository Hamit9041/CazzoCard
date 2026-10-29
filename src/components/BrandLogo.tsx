import React, { useState } from 'react';
import { getBrandLogoSources, getBrandInitials } from '../utils/brandLogo';

interface BrandLogoProps {
  storeName: string;
  customLogoUrl?: string;
  website?: string;
  primaryColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  altText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  storeName,
  customLogoUrl,
  website,
  primaryColor = '#e11d48',
  size = 'md',
  className = '',
  altText,
}) => {
  // Source attempt stages: 0 = Brandfetch (or customLogoUrl), 1 = Google Favicon, 2 = Lettermark
  const [sourceStage, setSourceStage] = useState<number>(0);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const { brandfetchUrl, googleFaviconUrl, domain } = getBrandLogoSources(storeName, website);
  const initials = getBrandInitials(storeName);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs rounded-xl',
    lg: 'w-13 h-13 sm:w-14 sm:h-14 text-sm sm:text-base rounded-2xl',
  }[size];

  const imageSizeClasses = {
    sm: 'w-5 h-5 max-w-[80%] max-h-[80%]',
    md: 'w-6 h-6 sm:w-7 sm:h-7 max-w-[82%] max-h-[82%]',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 max-w-[85%] max-h-[85%]',
  }[size];

  // Determine active image URL
  const activeUrl = customLogoUrl
    ? sourceStage === 0
      ? customLogoUrl
      : sourceStage === 1
      ? brandfetchUrl
      : googleFaviconUrl
    : sourceStage === 0
    ? brandfetchUrl
    : sourceStage === 1
    ? googleFaviconUrl
    : null;

  const handleImageError = () => {
    // Escalate to next stage
    setSourceStage((prev) => prev + 1);
  };

  const handleImageLoad = () => {
    setHasLoaded(true);
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-slate-700/60 shadow-md backdrop-blur-md overflow-hidden select-none transition-transform ${sizeClasses} ${className}`}
      title={`${storeName} (${domain})`}
    >
      {activeUrl && sourceStage < 2 ? (
        <img
          src={activeUrl}
          alt={altText || `${storeName} official logo`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          className={`object-contain transition-opacity duration-200 ${imageSizeClasses} ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {/* Fallback Lettermark / Initials if image is loading or unavailable */}
      {(!hasLoaded || sourceStage >= 2) && (
        <div
          className={`absolute inset-0 flex items-center justify-center font-black tracking-tight ${
            hasLoaded && sourceStage < 2 ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundColor: `${primaryColor}18`,
            color: primaryColor,
          }}
        >
          <span className="drop-shadow-xs font-mono">{initials}</span>
        </div>
      )}
    </div>
  );
};
