"use client";

import { Settings, LogOut, User, FolderOpen, Search, Monitor } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";

interface StartMenuProps {
  isOpen: boolean;
  accountName?: string;
  onOpenWindow: (id: string) => void;
}

export default function StartMenu({ isOpen, accountName = "Student", onOpenWindow }: StartMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[36px] left-0 w-[220px] h-[320px] bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xl z-[60] flex overflow-hidden font-sans select-none">
      {/* Premium Sidebar */}
      <div className="w-[28px] bg-gradient-to-b from-blue-900 to-blue-950 flex items-end justify-center pb-3 overflow-hidden border-r border-gray-400">
        <span className="text-[#c0c0c0] font-black text-[18px] transform rotate-90 origin-center whitespace-nowrap select-none tracking-tighter opacity-90">
          Campus<span className="text-white">OS</span>
        </span>
      </div>

      {/* Menu Options */}
      <div className="flex-1 flex flex-col py-0.5">
        {/* Account Area */}
        <div className="px-3 py-3 border-b border-gray-400 bg-[#dfdfdf]/50 flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white bg-white flex items-center justify-center shadow-[inset_1px_1px_rgba(0,0,0,0.1)]">
            <User size={18} className="text-blue-900" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[11px] font-bold truncate leading-none mb-0.5 text-blue-950">{accountName}</span>
            <span className="text-[9px] opacity-60 uppercase tracking-tighter font-bold">Standard Student</span>
          </div>
        </div>

        <div className="flex-1 py-1">
          <MenuLink icon={<FolderOpen size={16} />} label="My Vault" onClick={() => onOpenWindow('vault')} />
          <MenuLink icon={<Search size={16} />} label="StudyAI Assistant" onClick={() => onOpenWindow('studyai')} />
          <div className="h-[2px] border-t border-gray-400 border-b border-white my-1 mx-1" />
          <MenuLink icon={<Settings size={16} />} label="Settings..." onClick={() => onOpenWindow('system')} />
          <MenuLink icon={<Monitor size={16} />} label="Display Properties" onClick={() => onOpenWindow('system')} />
        </div>

        <div className="h-[2px] border-t border-gray-400 border-b border-white my-1 mx-1" />
        <button 
          className="flex items-center gap-3 px-3 py-2 hover:bg-blue-900 hover:text-white group text-black w-full text-left transition-colors duration-75"
          onClick={async () => {
             await signOut();
          }}
        >
          <div className="text-blue-900 group-hover:text-white transition-colors">
            <LogOut size={16} />
          </div>
          <span className="text-[11px] font-medium">Log Out {accountName}...</span>
        </button>
      </div>
    </div>
  );
}

function MenuLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center gap-3 px-4 py-2 hover:bg-blue-900 hover:text-white group text-black w-full text-left"
    >
      <div className="text-gray-700 group-hover:text-white">
        {icon}
      </div>
      <span className="text-[11px] font-sans font-medium">{label}</span>
    </button>
  );
}
