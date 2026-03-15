"use client";

import { ReactNode, useState, useEffect, useRef } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  width?: string;
  height?: string;
  isMaximized?: boolean;
  iconUrl?: string;
}

const TitleBarButton = ({
  label,
  children,
  onClick,
  onMouseDown,
}: {
  label: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      aria-label={label}
      onMouseDown={(e) => { setPressed(true); onMouseDown(e); }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        // Explicit size overrides — defeats 98.css min-width: 75px on buttons
        width: "16px",
        height: "14px",
        minWidth: "16px",
        minHeight: "14px",
        maxWidth: "16px",
        maxHeight: "14px",
        // Reset all paddings/margins that 98.css injects
        padding: 0,
        margin: 0,
        marginLeft: "2px",
        lineHeight: 1,
        boxSizing: "border-box",
        // Styling
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: pressed
          ? "#0a0a0a #dfdfdf #dfdfdf #0a0a0a"
          : "#dfdfdf #0a0a0a #0a0a0a #dfdfdf",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transform: pressed ? "translate(1px,1px)" : "none",
        overflow: "hidden",
      }}
    >
      {children}
    </button>
  );
};

export default function Window({
  title,
  children,
  onClose,
  onMaximize,
  onMinimize,
  onFocus,
  width = "600px",
  height = "400px",
  isMaximized: initialMaximized,
  iconUrl,
}: WindowProps) {
  const [pos, setPos] = useState({ x: 80, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(initialMaximized || false);
  const dragStart = useRef({ x: 0, y: 0 });

  const toggleMaximize = () => {
    setIsMaximized((v) => !v);
    onMaximize?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".title-btn-group")) return;
    if (isMaximized) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus?.();
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const up = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    }
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isDragging]);

  const wStyle: React.CSSProperties = {
    position: "absolute",
    width: isMaximized ? "100vw" : width,
    height: isMaximized ? "calc(100vh - 36px)" : height,
    top: isMaximized ? 0 : `${pos.y}px`,
    left: isMaximized ? 0 : `${pos.x}px`,
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#ffffff #808080 #808080 #ffffff",
    boxShadow: "inset 1px 1px 0px #dfdfdf, inset -1px -1px 0px #0a0a0a, 3px 3px 12px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    userSelect: "none",
    zIndex: 1,
    pointerEvents: "auto", // override inherited 'none' from parent overlay
  };

  return (
    <div style={wStyle} onMouseDown={onFocus}>
      {/* ── Title Bar ── */}
      <div
        style={{
          background: "var(--win95-title-gradient, linear-gradient(to right, #000080, #1084d0))",
          height: "22px",
          minHeight: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 3px 0 4px",
          cursor: isMaximized ? "default" : "move",
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        {/* Left: icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden", flex: 1, minWidth: 0 }}>
          {iconUrl && (
            <img
              src={iconUrl}
              alt=""
              style={{ width: "14px", height: "14px", imageRendering: "pixelated", flexShrink: 0 }}
            />
          )}
          <span
            style={{
              color: "white",
              fontSize: "11px",
              fontWeight: "bold",
              fontFamily: "'MS Sans Serif', 'Segoe UI', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        </div>

        {/* Right: window controls */}
        <div className="title-btn-group" style={{ display: "flex", alignItems: "center", gap: "1px" }}>
          {/* Minimize */}
          <TitleBarButton
            label="Minimize"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
          >
            {/* Underscore bar */}
            <span style={{ display: "block", width: "7px", height: "2px", background: "#000", marginTop: "6px", flexShrink: 0 }} />
          </TitleBarButton>

          {/* Maximize / Restore */}
          <TitleBarButton
            label={isMaximized ? "Restore" : "Maximize"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
          >
            {isMaximized ? (
              /* Restore icon: two overlapping squares */
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="2" y="0" width="7" height="6" fill="none" stroke="#000" strokeWidth="1.2"/>
                <rect x="0" y="2" width="7" height="6" fill="#c0c0c0" stroke="#000" strokeWidth="1.2"/>
              </svg>
            ) : (
              /* Maximize icon: single square with thick top border */
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="0.5" y="0.5" width="8" height="8" fill="none" stroke="#000" strokeWidth="1.2"/>
                <rect x="0.5" y="0.5" width="8" height="2" fill="#000"/>
              </svg>
            )}
          </TitleBarButton>

          {/* Close — slightly wider with bold X */}
          <TitleBarButton
            label="Close"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          >
            <span style={{ fontSize: "10px", fontWeight: "bold", lineHeight: 1, color: "#000", fontFamily: "Arial" }}>✕</span>
          </TitleBarButton>
        </div>
      </div>

      {/* ── Menu bar separator line ── */}
      <div style={{ height: "1px", background: "#808080" }} />
      <div style={{ height: "1px", background: "#ffffff" }} />

      {/* Drag overlay */}
      {isDragging && <div style={{ position: "absolute", inset: 0, zIndex: 999, cursor: "move" }} />}

      {/* ── Window Body ── */}
      <div
        style={{
          flex: 1,
          margin: "2px",
          background: "#c0c0c0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
