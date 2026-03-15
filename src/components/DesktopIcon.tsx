import { useState, useEffect } from "react";

interface DesktopIconProps {
  iconText?: string;
  iconUrl?: string;
  gradient?: string;
  label: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  locked?: boolean;
  pulsing?: boolean;
}

export default function DesktopIcon({ iconText, iconUrl, gradient, label, onClick, onDoubleClick, onContextMenu, locked, pulsing }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);

  // Handle single click for selection
  const handleSingleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    onClick?.();
  };

  // Handle double click for opening
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.();
  };

  // Deselect when clicking outside (handled by parent/layout click listener)
  useEffect(() => {
    const handleOutsideClick = () => setIsSelected(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const content = (
    <div 
      className={`relative flex flex-col items-center gap-1 cursor-pointer select-none w-[70px] pt-1
        ${locked ? 'opacity-30 grayscale filter cursor-not-allowed' : ''}`}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          setIsSelected(true);
          onContextMenu(e);
        }
      }}
    >
      {/* Retro Icon Container */}
      <div 
        className={`w-12 h-12 flex items-center justify-center relative rounded-sm
          ${isSelected ? 'bg-blue-900/10' : 'group-hover:bg-white/5'}`}
      >
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={label} 
            className={`w-10 h-10 image-pixelated pointer-events-none object-contain transition-all duration-75
              ${isSelected ? 'brightness-75 sepia-[0.2] hue-rotate-[200deg] contrast-125' : ''}`}
          />
        ) : (
          <span className="text-3xl relative z-10">{iconText || "📄"}</span>
        )}
      </div>

      {/* Label - Authentic Win98 Highlight */}
      <div className="flex flex-col items-center w-full px-1">
        <span 
          className={`text-[10px] text-white text-center font-sans leading-tight py-[1px] px-1 line-clamp-2 max-w-full
            ${isSelected 
              ? 'bg-[#000080] border border-dotted border-white/60' 
              : 'border border-transparent'}`}
          style={{ textShadow: isSelected ? 'none' : '1px 1px 1px rgba(0,0,0,0.9)' }}
        >
          {label}
        </span>
      </div>
    </div>
  );

  return <div className="w-[70px] h-[90px] flex items-center justify-center">{content}</div>;
}
