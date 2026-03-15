"use client";

import { useState, useEffect } from "react";
import { login, signup } from "./actions";

export default function LoginPage() {
  const [showBoot, setShowBoot] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  useEffect(() => {
    const lines = [
      "AMIBIOS (C) 1995 American Megatrends, Inc.",
      "CampusOS v1.0.0-Beta BIOS Revision 4.01",
      "CPU: Intel(R) Pentium(R) Processor @ 133 MHz",
      "Memory Test: 65536K OK",
      "",
      "Detecting Primary Master ... Found [CAMPUS_OS_HDD]",
      "Detecting Secondary Master ... Found [SUMMARIZER_UNIT]",
      "",
      "Initialising Auth.sys protocol ...",
      "Verifying kernel integrity ...",
      "Starting CampusOS login manager ...",
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setBootLines((prev) => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowSplash(true);
          setTimeout(() => {
            setShowSplash(false);
            setShowBoot(false);
          }, 2000); // Splash duration
        }, 500);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setConfirmationRequired(false);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match. Please verify your security sequence.");
      setIsLoading(false);
      return;
    }

    const result = (isSignUp ? await signup(formData) : await login(formData)) as any;

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.confirmationRequired) {
      setConfirmationRequired(true);
      setIsLoading(false);
    }
  }

  if (showBoot) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col p-8 z-[2000] overflow-hidden select-none cursor-none scanline-flicker">
        <div className="crt-overlay" />
        
        {!showSplash ? (
          <div className="bios-text text-[10px] leading-relaxed flex flex-col gap-1">
            <div className="flex justify-between mb-8">
              <img 
                src="https://img.icons8.com/color/48/000000/processor.png" 
                className="w-12 h-12 grayscale" 
                alt="BIOS Logo" 
              />
              <div className="text-right">
                <p>v1.0.0-BETA</p>
                <p>March 15, 1995</p>
              </div>
            </div>
            {bootLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <div className="mt-4 animate-pulse">_</div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <h1 className="bios-text text-4xl font-bold tracking-[10px] animate-pulse">
              CampusOS
            </h1>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-hidden text-black">
      <div className="background-effects">
        <div className="pixel-moon" />
        {Array.from({ length: 60 }).map((_, i) => (
          <div 
            key={i} 
            className="pixel-star twinkle"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              '--duration': `${2 + Math.random() * 4}s`,
              '--delay': `${Math.random() * 5}s`
            } as any}
          />
        ))}
        <div className="school-rooftops">
          {/* Windows: Left Tall Building - Room Clusters */}
          {[
            { b: 50, l: 23, type: 'warm' }, { b: 50, l: 27, type: 'warm' },
            { b: 75, l: 23, type: 'cool' }, { b: 75, l: 27, type: 'cool' },
            { b: 100, l: 25, type: 'standard' },
          ].map((win, idx) => (
            Math.random() > 0.3 && (
              <div 
                key={`lt-${idx}`} 
                className={`window-light ${win.type}`} 
                style={{ '--bottom': `${win.b}px`, '--left': `${win.l}%` } as any} 
              />
            )
          ))}

          {/* Windows: Central Hall - Room Clusters */}
          {[
            { b: 65, l: 43, type: 'warm' }, { b: 65, l: 47, type: 'warm' },
            { b: 65, l: 55, type: 'cool' }, { b: 65, l: 59, type: 'cool' },
            { b: 85, l: 45, type: 'standard' }, { b: 85, l: 49, type: 'standard' },
          ].map((win, idx) => (
            Math.random() > 0.4 && (
              <div 
                key={`ch-${idx}`} 
                className={`window-light ${win.type}`} 
                style={{ '--bottom': `${win.b}px`, '--left': `${win.l}%` } as any} 
              />
            )
          ))}

          {/* Windows: Right Tall Building - Room Clusters */}
          {[
            { b: 50, l: 73, type: 'cool' }, { b: 50, l: 77, type: 'cool' },
            { b: 80, l: 73, type: 'warm' }, { b: 80, l: 77, type: 'warm' },
            { b: 110, l: 75, type: 'standard' },
          ].map((win, idx) => (
            Math.random() > 0.3 && (
              <div 
                key={`rt-${idx}`} 
                className={`window-light ${win.type}`} 
                style={{ '--bottom': `${win.b}px`, '--left': `${win.l}%` } as any} 
              />
            )
          ))}
          
          {/* Subtle architectural markers using cooler, dimmer lights */}
          <div className="absolute bottom-[105px] left-[25%] -translate-x-1/2 w-px h-10 bg-white/5" />
          <div className="absolute bottom-[105px] left-[75%] -translate-x-1/2 w-px h-10 bg-white/5" />
        </div>
      </div>
      
      {/* Simulation of centered Win95 login window */}
      <div className="window shadow-[4px_4px_30px_rgba(0,0,0,0.9)] bg-[#c0c0c0] relative z-10" style={{ width: "420px" }}>
        <div className="title-bar">
          <div className="title-bar-text">
            {isSignUp ? "CampusOS Setup - Registration" : "Welcome to CampusOS"}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Help" />
            <button aria-label="Close" onClick={() => window.location.reload()} />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="window-body">
          {/* Top Banner Area */}
          <div className="mb-4 -mx-1 -mt-1 border-b border-gray-400 overflow-hidden shadow-[inset_0_-1px_white]">
            <div className="relative h-28 bg-[#000080] flex items-center justify-between px-6 overflow-hidden">
               <div className="z-10 flex flex-col justify-center">
                 <h1 className="text-white text-lg font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-press-start)', fontSize: '14px' }}>
                   CampusOS
                 </h1>
                 <p className="text-white text-[9px] font-bold uppercase tracking-wider opacity-80" style={{ fontFamily: 'var(--font-press-start)' }}>
                   System Engine v1.0
                 </p>
               </div>
               <img 
                 src="https://img.icons8.com/color/96/000000/imac.png" 
                 className="w-14 h-14 z-10 brightness-110 flex-shrink-0" 
                 alt="CampusOS" 
               />
            </div>
          </div>

          <div className="flex gap-4 px-2 py-4">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
               <img 
                 src="https://img.icons8.com/color/48/000000/key.png" 
                 alt="Security" 
                 className="w-12 h-12 image-pixelated" 
               />
               <span className="text-[9px] font-bold text-gray-700">AUTH.SYS</span>
            </div>
            
            <div className="flex-grow flex flex-col gap-4">
              <p className="text-[11px] leading-tight font-sans">
                {isSignUp 
                  ? "To create a new student profile, please enter a valid email address and choose a secure password."
                  : "Please provide your student credentials to initialize the CampusOS desktop environment."}
              </p>

              {!confirmationRequired ? (
                <>
                  <div className="field-row-stacked">
                    <label htmlFor="email" className="font-bold">E-mail Address:</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      autoComplete="username" 
                      required 
                      className="bg-white border-2 border-gray-500 shadow-[inset_1px_1px_black]"
                      placeholder="student@campus.edu"
                    />
                  </div>

                  {isSignUp && (
                    <div className="field-row-stacked animate-in slide-in-from-top-1 duration-200">
                      <label htmlFor="username" className="font-bold text-blue-800">Display Name / Username:</label>
                      <input 
                        id="username" 
                        name="username" 
                        type="text" 
                        required
                        className="bg-white border-2 border-gray-500 shadow-[inset_1px_1px_black]"
                        placeholder="e.g. Neo"
                      />
                    </div>
                  )}

                  <div className="field-row-stacked">
                    <label 
                      htmlFor="password" 
                      className={`font-bold ${isSignUp ? "text-blue-800" : ""}`}
                    >
                      {isSignUp ? "Set Password:" : "Password:"}
                    </label>
                    <input 
                      id="password" 
                      name="password" 
                      type="password" 
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      className="bg-white border-2 border-gray-500 shadow-[inset_1px_1px_black]"
                      placeholder="••••••••"
                    />
                  </div>

                  {isSignUp && (
                    <div className="field-row-stacked animate-in slide-in-from-top-1 duration-200">
                      <label htmlFor="confirmPassword" className="font-bold">Confirm Password:</label>
                      <input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password" 
                        autoComplete="new-password"
                        required
                        className="bg-white border-2 border-gray-500 shadow-[inset_1px_1px_black]"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 border-2 border-blue-500 bg-[#eef6ff] text-blue-900 text-[11px] font-sans flex flex-col gap-3 shadow-[2px_2px_0px_white]">
                   <div className="flex items-center gap-2 font-bold text-blue-700">
                     <img src="https://img.icons8.com/color/48/000000/check-all.png" className="w-5 h-5" alt="Success" />
                     <span>REGISTRATION PENDING</span>
                   </div>
                   <div className="bg-white p-2 border border-blue-200">
                     <p className="font-bold mb-1">📬 Check your Gmail / Inbox</p>
                     <p>A verification sequence has been dispatched. You MUST click the link in your email to activate your profile before logging on.</p>
                   </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-2">
                  <p className="text-[9px] mb-1">Authenticating protocol...</p>
                  <div className="w-full h-4 bg-gray-300 border border-gray-600 p-[1px]">
                    <div className="flex gap-[1px] h-full overflow-hidden">
                       {Array.from({ length: 15 }).map((_, i) => (
                         <div key={i} className="bg-blue-900 w-3 h-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2 border-2 border-red-500 bg-[#ffeceb] text-red-700 text-[10px] font-sans flex items-center gap-2">
                   <img src="https://img.icons8.com/color/48/000000/info.png" className="w-4 h-4" alt="Error" />
                   <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 p-2 mt-2 pt-4 border-t border-white shadow-[0_-1px_#c0c0c0]">
            {!confirmationRequired ? (
              <>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-[85px] h-7 font-sans text-xs"
                >
                  {isSignUp ? "Register" : "Log In"}
                </button>
                <button 
                  type="button" 
                  className="min-w-[85px] h-7 font-sans text-xs"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                >
                  {isSignUp ? "Cancel" : "Register"}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="min-w-[85px] h-7 font-sans text-xs"
                onClick={() => {
                  setConfirmationRequired(false);
                  setIsSignUp(false);
                }}
              >
                Return to Login
              </button>
            )}
          </div>
        </form>

        <div className="status-bar">
          <p className="status-bar-field">System: {confirmationRequired ? "Awaiting Activation" : "Ready"}</p>
          <p className="status-bar-field">Memory: 64.0MB RAM</p>
          <p className="status-bar-field">Ver: 1.0.0-Beta</p>
        </div>
      </div>
    </main>
  );
}
