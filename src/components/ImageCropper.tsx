"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedBase64: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 90 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper({ isOpen, onClose, imageUrl, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspect = 16 / 9; // Default desktop aspect ratio attempt
    setCrop(centerAspectCrop(width, height, aspect));
  };


  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
        onClose();
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    ctx.imageSmoothingQuality = "high";

    const cropX = Math.floor(completedCrop.x * scaleX);
    const cropY = Math.floor(completedCrop.y * scaleY);
    const cropWidth = Math.floor(completedCrop.width * scaleX);
    const cropHeight = Math.floor(completedCrop.height * scaleY);

    ctx.drawImage(
      imgRef.current,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64Url = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(base64Url);
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="select-none flex flex-col"
        style={{
          width: "90vw",
          maxWidth: "800px",
          height: "90vh",
          maxHeight: "600px",
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow: "inset 1px 1px 0px #dfdfdf, inset -1px -1px 0px #0a0a0a, 4px 4px 10px rgba(0,0,0,0.4)",
          fontFamily: "'MS Sans Serif', sans-serif",
        }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside
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
             <span style={{ fontSize: "12px", lineHeight: 1 }}>✂️</span>
            <span style={{ color: "white", fontSize: "11px", fontWeight: "bold", fontFamily: "inherit" }}>
              Image Cropper Utility
            </span>
          </div>
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
             onMouseDown={(e) => { e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080"; }}
             onMouseUp={(e) => { e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff"; }}
          >
            ✕
          </button>
        </div>

        {/* Separator */}
        <div style={{ height: "2px", background: "#808080", margin: "0 2px" }} />
        <div style={{ height: "1px", background: "#ffffff", margin: "0 2px" }} />

        {/* Content Area */}
        <div style={{ flex: 1, padding: "8px", overflow: "hidden", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{
                flex: 1,
                background: "#000",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                boxShadow: "inset 1px 1px 0px #0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto"
            }}>
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={16 / 9} // Lock to typical desktop aspect ratio 
                >
                    <img 
                      ref={imgRef} 
                      src={imageUrl} 
                      onLoad={onImageLoad}
                      alt="Crop target" 
                      style={{ maxHeight: "calc(90vh - 100px)", maxWidth: "100%" }}
                    />
                </ReactCrop>
            </div>
            
            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                onClick={onClose}
                style={{
                    width: "auto",
                    minWidth: "75px",
                    padding: "0 12px",
                    height: "23px",
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    boxShadow: "inset 1px 1px 0px #dfdfdf",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "inherit",
                }}
                onMouseDown={(e) => { e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080"; e.currentTarget.style.boxShadow = "none"; }}
                onMouseUp={(e) => { e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff"; e.currentTarget.style.boxShadow = "inset 1px 1px 0px #dfdfdf"; }}
                >
                Cancel
                </button>
                <button
                onClick={applyCrop}
                style={{
                    width: "auto",
                    minWidth: "75px",
                    padding: "0 12px",
                    height: "23px",
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    boxShadow: "inset 1px 1px 0px #dfdfdf",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "inherit",
                    fontWeight: "bold",
                    outline: "1px dotted #000000",
                    outlineOffset: "-4px",
                    whiteSpace: "nowrap",
                }}
                 onMouseDown={(e) => { e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080"; e.currentTarget.style.boxShadow = "none"; }}
                 onMouseUp={(e) => { e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff"; e.currentTarget.style.boxShadow = "inset 1px 1px 0px #dfdfdf"; }}
                >
                Crop & Apply
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
