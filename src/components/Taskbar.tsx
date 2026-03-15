"use client";

import { ReactNode, useState, useEffect } from "react";
import { useStreak } from "@/hooks/useStreak";


import { FileText, Folder, Settings, Monitor, LogOut, User, FolderOpen, Search, Monitor as MonitorIcon, LayoutGrid } from "lucide-react";
import StartMenu from "./StartMenu";

interface TaskItem {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  isMinimized: boolean;
}

interface TaskbarProps {
  onOpenWindow: (id: string) => void;
  openWindows: TaskItem[];
  onTaskClick: (id: string) => void;
  accountName?: string;
  streakCount?: number;
}

export default function Taskbar({ onOpenWindow, openWindows, onTaskClick, accountName, streakCount }: TaskbarProps) {
  const [time, setTime] = useState("");
  const { streak } = useStreak(streakCount);
  const [isStartOpen, setIsStartOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <StartMenu
        isOpen={isStartOpen}
        accountName={accountName}
        onOpenWindow={(id) => {
          onOpenWindow(id);
          setIsStartOpen(false);
        }}
      />

      {/* ── Taskbar Bar ── */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) setIsStartOpen(false); }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "34px",
          background: "#c0c0c0",
          borderTop: "2px solid #ffffff",
          borderBottom: "2px solid #808080",
          display: "flex",
          alignItems: "center",
          padding: "0 3px",
          gap: "3px",
          zIndex: 9999,
          userSelect: "none",
          boxSizing: "border-box",
          boxShadow: "inset 0 1px 0 #dfdfdf",
        }}
      >
        {/* START BUTTON */}
        <button
          onClick={() => setIsStartOpen(!isStartOpen)}
          style={{
            height: "26px",
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#c0c0c0",
            border: "2px solid",
            borderColor: isStartOpen
              ? "#808080 #ffffff #ffffff #808080"
              : "#ffffff #808080 #808080 #ffffff",
            boxShadow: isStartOpen
              ? "inset 1px 1px 3px rgba(0,0,0,0.3)"
              : "none",
            cursor: "pointer",
            fontFamily: "'MS Sans Serif', sans-serif",
            fontWeight: "bold",
            fontSize: "12px",
            flexShrink: 0,
          }}
        >
          <img
            src="/icons/directory_closed-4.png"
            alt=""
            style={{ width: "16px", height: "16px", imageRendering: "pixelated", filter: "grayscale(0.3) brightness(1.2)" }}
          />
          <span style={{ fontWeight: "bold", fontSize: "11px" }}>Campus</span>
        </button>

        {/* SEPARATOR */}
        <div style={{ width: "1px", height: "24px", background: "#808080", marginRight: "1px" }} />
        <div style={{ width: "1px", height: "24px", background: "#ffffff", marginRight: "3px" }} />

        {/* OPEN WINDOWS / TASKBAR BUTTONS */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "3px", overflow: "hidden" }}>
          {openWindows.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              style={{
                height: "26px",
                minWidth: "120px",
                maxWidth: "160px",
                padding: "0 6px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "#c0c0c0",
                border: "2px solid",
                borderColor: task.isActive
                  ? "#808080 #ffffff #ffffff #808080"
                  : "#ffffff #808080 #808080 #ffffff",
                boxShadow: task.isActive ? "inset 1px 1px 0 #0a0a0a" : "none",
                cursor: "pointer",
                fontFamily: "'MS Sans Serif', sans-serif",
                fontSize: "11px",
                fontWeight: task.isActive ? "bold" : "normal",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {task.icon && (
                <img
                  src={task.icon}
                  alt=""
                  style={{ width: "14px", height: "14px", imageRendering: "pixelated", flexShrink: 0 }}
                />
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {task.title}
              </span>
            </button>
          ))}
        </div>

        {/* SYSTEM TRAY */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "auto" }}>
          {/* Streak */}
          {streak > 0 && (
            <div
              style={{
                height: "26px",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                background: "#c0c0c0",
                fontSize: "11px",
                fontFamily: "'MS Sans Serif', sans-serif",
                fontWeight: "bold",
              }}
            >
              🔥 {streak}
            </div>
          )}

          {/* Separator */}
          <div style={{ width: "1px", height: "24px", background: "#808080" }} />
          <div style={{ width: "1px", height: "24px", background: "#ffffff" }} />

          {/* Clock */}
          <div
            style={{
              height: "26px",
              minWidth: "68px",
              padding: "0 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid",
              borderColor: "#808080 #ffffff #ffffff #808080",
              background: "#c0c0c0",
              fontSize: "11px",
              fontFamily: "'MS Sans Serif', sans-serif",
            }}
          >
            {time}
          </div>
        </div>
      </div>
    </>
  );
}
