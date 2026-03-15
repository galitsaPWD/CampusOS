"use client";

import React from "react";

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  return (
    <div 
      className="fixed z-[1000] min-w-[150px] bg-[#c0c0c0] select-none p-[2px]"
      style={{ 
        top: y, left: x,
        borderTop: "1px solid #ffffff",
        borderLeft: "1px solid #ffffff",
        borderRight: "1px solid #000000",
        borderBottom: "1px solid #000000",
        boxShadow: "inset 1px 1px 0px #dfdfdf, inset -1px -1px 0px #808080, 4px 4px 10px rgba(0,0,0,0.3)",
      }}
      onMouseLeave={onClose}
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.label === "SEPARATOR" ? (
            <div style={{ height: "2px", borderTop: "1px solid #808080", borderBottom: "1px solid #ffffff", margin: "2px 1px" }} />
          ) : (
            <div
              role="button"
              className={`flex items-center gap-3 px-4 py-[3px] w-full text-left transition-none ${
                item.disabled 
                  ? "opacity-50 text-black cursor-not-allowed" 
                  : "hover:bg-[#000080] hover:text-white text-black cursor-pointer"
              }`}
              onClick={(e) => {
                if (item.disabled) return;
                e.stopPropagation();
                item.onClick();
                onClose();
              }}
            >
              <span className="text-[11px] font-sans" style={{ fontFamily: "'MS Sans Serif', sans-serif" }}>{item.label}</span>
            </div>
          )}
        </React.Fragment>
      ))}

      <style jsx>{`
        button {
          -webkit-font-smoothing: none;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
