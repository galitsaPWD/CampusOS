"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function CatGame({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isError, setIsError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [targetClicks] = useState(() => Math.floor(Math.random() * 6) + 5); // 5 to 10
  const [btnPos, setBtnPos] = useState({ top: "24px", right: "24px" });
  const [isTeleporting, setIsTeleporting] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
          setIsMuted(true);
        }
      });
    }
  }, []);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setIsMuted(false);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTeleporting) return;

    const nextCount = clickCount + 1;
    if (nextCount >= targetClicks) {
      onClose();
    } else {
      setClickCount(nextCount);
      setIsTeleporting(true);
      
      // Delay before teleporting to a new spot
      setTimeout(() => {
        const randomTop = Math.floor(Math.random() * 70) + 15;
        const randomRight = Math.floor(Math.random() * 70) + 15;
        setBtnPos({ top: `${randomTop}%`, right: `${randomRight}%` });
        setIsTeleporting(false);
      }, 500); // 500ms delay for "playing around"
    }
  };

  return (
    <div className="fixed inset-0 z-[200001] flex items-center justify-center bg-black font-sans text-white pointer-events-auto select-none overflow-hidden group">
      {/* Absolute solid black layer to prevent background glimpse */}
      <div className="absolute inset-0 bg-black z-[-1]" />
      
      {/* Interaction layer */}
      <div className="absolute inset-0 z-0" onClick={handleManualPlay} />

      {/* TROLL Close Button - Using a DIV to bypass global 'button' styles from 98.css */}
      {!isTeleporting && (
        <div 
          role="button"
          onClick={handleCloseClick}
          style={{ 
            top: btnPos.top, 
            right: btnPos.right, 
            transition: 'none',
            position: 'absolute',
            zIndex: 200003,
            cursor: 'default'
          }}
          className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-white/90 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 shadow-lg"
          title="Close"
        >
          <X size={18} strokeWidth={3} />
        </div>
      )}

      {/* Video Viewport - object-contain ensures no cutting */}
      <div className="w-full h-full relative flex items-center justify-center bg-black">
        <video 
          ref={videoRef}
          className="w-full h-full object-contain pointer-events-none"
          src="/games/cat_meme.mp4"
          autoPlay
          loop
          playsInline
          onError={() => setIsError(true)}
        />

        {/* Fallback Overlay for Unmuted Interaction */}
        {isMuted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="px-6 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full animate-pulse">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Click for sound</p>
             </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-red-500 p-6 text-center">
            <AlertTriangle size={24} className="mb-2 opacity-50" />
            <p className="text-sm font-bold tracking-[0.4em] uppercase">SEQUENCE_FAULT</p>
          </div>
        )}
      </div>
    </div>
  );
}
