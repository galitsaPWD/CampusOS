"use client";

import React from "react";

interface MessageBoxProps {
  title?: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  onClose: () => void;
  isOpen: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  success: (
    <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center">
      {/* Classic Win98 green checkmark-in-circle */}
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[32px] h-[32px]">
        <circle cx="16" cy="16" r="14" fill="#008000" stroke="#004400" strokeWidth="1.5"/>
        <polyline points="8,17 13,22 24,11" stroke="white" strokeWidth="2.5" strokeLinecap="square"/>
      </svg>
    </div>
  ),
  error: (
    <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[32px] h-[32px]">
        <circle cx="16" cy="16" r="14" fill="#cc0000" stroke="#880000" strokeWidth="1.5"/>
        <line x1="10" y1="10" x2="22" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="square"/>
        <line x1="22" y1="10" x2="10" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="square"/>
      </svg>
    </div>
  ),
  warning: (
    <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[32px] h-[32px]">
        <polygon points="16,3 30,29 2,29" fill="#ffcc00" stroke="#886600" strokeWidth="1.5"/>
        <rect x="14.5" y="11" width="3" height="10" fill="#000" rx="0"/>
        <rect x="14.5" y="23" width="3" height="3" fill="#000" rx="0"/>
      </svg>
    </div>
  ),
  info: (
    <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[32px] h-[32px]">
        <circle cx="16" cy="16" r="14" fill="#000099" stroke="#000066" strokeWidth="1.5"/>
        <rect x="14.5" y="13" width="3" height="11" fill="white" rx="0"/>
        <rect x="14.5" y="9" width="3" height="3" fill="white" rx="0"/>
      </svg>
    </div>
  ),
};

export default function MessageBox({ title = "System Message", message, type = "info", onClose, isOpen }: MessageBoxProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Dialog Window */}
      <div
        className="select-none"
        style={{
          width: "360px",
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow: "inset 1px 1px 0px #dfdfdf, inset -1px -1px 0px #0a0a0a, 4px 4px 10px rgba(0,0,0,0.4)",
          fontFamily: "'MS Sans Serif', sans-serif",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            background: "linear-gradient(to right, #000080, #1084d0)",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 3px 0 6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Mini icon in title bar */}
            <span style={{ fontSize: "12px", lineHeight: 1 }}>
              {type === "success" ? "🖥️" : type === "error" ? "🚫" : type === "warning" ? "⚠️" : "ℹ️"}
            </span>
            <span style={{ color: "white", fontSize: "11px", fontWeight: "bold", fontFamily: "inherit" }}>
              {title}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: "16px",
              height: "14px",
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#ffffff #808080 #808080 #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "9px",
              fontWeight: "bold",
              lineHeight: 1,
              padding: 0,
              fontFamily: "Arial, sans-serif",
            }}
            onMouseDown={(e) => {
              const t = e.currentTarget;
              t.style.borderColor = "#808080 #ffffff #ffffff #808080";
            }}
            onMouseUp={(e) => {
              const t = e.currentTarget;
              t.style.borderColor = "#ffffff #808080 #808080 #ffffff";
            }}
          >
            ✕
          </button>
        </div>

        {/* Separator */}
        <div style={{ height: "2px", background: "#808080", margin: "0 2px" }} />
        <div style={{ height: "1px", background: "#ffffff", margin: "0 2px" }} />

        {/* Content */}
        <div style={{ padding: "16px 16px 12px 16px" }}>
          {/* Icon + Message row */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "18px" }}>
            {ICONS[type] || ICONS.info}
            <p
              style={{
                fontSize: "11px",
                lineHeight: "1.5",
                color: "#000000",
                margin: 0,
                fontFamily: "inherit",
                flex: 1,
              }}
            >
              {message}
            </p>
          </div>

          {/* Button row */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={onClose}
              autoFocus
              style={{
                width: "80px",
                height: "23px",
                background: "#c0c0c0",
                border: "2px solid",
                borderColor: "#ffffff #808080 #808080 #ffffff",
                boxShadow: "inset 1px 1px 0px #dfdfdf",
                cursor: "pointer",
                fontSize: "11px",
                fontFamily: "inherit",
                fontWeight: "normal",
                outline: "1px dotted #000000",
                outlineOffset: "-4px",
              }}
              onMouseDown={(e) => {
                const t = e.currentTarget;
                t.style.borderColor = "#808080 #ffffff #ffffff #808080";
                t.style.boxShadow = "none";
              }}
              onMouseUp={(e) => {
                const t = e.currentTarget;
                t.style.borderColor = "#ffffff #808080 #808080 #ffffff";
                t.style.boxShadow = "inset 1px 1px 0px #dfdfdf";
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
