"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, ChevronRight, Play } from "lucide-react";

export default function GameDownloader({ installApp, uninstallApp, installedApps = [] }: { 
  installApp: (id: string) => void, 
  uninstallApp: (id: string) => void,
  installedApps?: string[]
}) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const isInstalled = installedApps.includes("catgame");

  const startInstall = () => {
    setIsInstalling(true);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          installApp("catgame");
          setIsInstalling(false);
        }, 500);
      }
      setProgress(current);
    }, 200);
  };

  const handleUninstall = () => {
    uninstallApp("catgame");
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans overflow-hidden">
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b-2 border-white border-r-gray-800 border-b-gray-800 pb-3 shadow-[inset_-1px_-1px_#000,1px_1px_#fff] flex-shrink-0">
          <div className="w-10 h-10 bg-blue-900 flex items-center justify-center border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white flex-shrink-0">
            <Download className="text-white" size={20} />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-[14px] font-bold m-0 leading-tight truncate">CampusGame Center</h2>
            <p className="text-[9px] opacity-70 m-0">v1.2 - All games are definitely verified.</p>
          </div>
        </div>

        {/* Game Listing */}
        <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white overflow-y-auto">
          <div className="p-2 flex items-start gap-3 hover:bg-blue-900/5 transition-colors border-b border-gray-100">
            <div className="w-10 h-10 border border-gray-400 bg-gray-100 flex items-center justify-center flex-shrink-0">
               <img src="/icons/catgame-0.png" className="w-8 h-8 opacity-90" alt="Icon" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-bold truncate">Normal Cat Game</span>
                <span className="text-[8px] px-1 bg-green-100 text-green-800 border border-green-200 font-bold">FREE</span>
              </div>
              <p className="text-[10px] text-gray-600 mb-2 leading-tight">
                A perfectly normal game featuring a very normal cat. No memes included. 100% genuine gameplay.
              </p>
              
              {isInstalled ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-green-700 font-bold text-[10px]">
                    <CheckCircle2 size={12} />
                    Installed
                  </div>
                  <button 
                    onClick={handleUninstall}
                    className="px-2 py-0.5 bg-[#c0c0c0] border border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-[9px] font-bold active:border-inset hover:bg-gray-200"
                  >
                    Uninstall
                  </button>
                </div>
              ) : isInstalling ? (
                <div className="flex flex-col gap-1 w-full max-w-[200px]">
                  <div className="text-[9px] mb-0.5">Downloading... {Math.round(progress)}%</div>
                  <div className="h-3 w-full bg-[#c0c0c0] border border-t-gray-800 border-l-gray-800 border-r-white border-b-white p-[1px]">
                     <div 
                       className="h-full bg-blue-900" 
                       style={{ width: `${progress}%` }} 
                     />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={startInstall}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-[10px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white hover:bg-[#d0d0d0]"
                >
                  <Download size={10} /> Install to Desktop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-2 border-t border-gray-400 flex justify-end gap-2 bg-[#dfdfdf] flex-shrink-0">
        <button className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-[11px] opacity-50 cursor-not-allowed">
          Back
        </button>
        <button className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-[11px] opacity-50 cursor-not-allowed">
          Next <ChevronRight size={10} className="inline" />
        </button>
      </div>
    </div>
  );
}
