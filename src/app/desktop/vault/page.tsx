"use client";

import React, { useEffect, useState } from "react";
import { getVaultItems, deleteVaultItem } from "@/app/actions/vault";
import { Folder, FileText, Trash2, ExternalLink, Loader2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface VaultItem {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
}

export default function VaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      const data = await getVaultItems();
      setItems(data as VaultItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this study guide from your memory?")) return;
    try {
      await deleteVaultItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  // Group items by subject
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.subject]) acc[item.subject] = [];
    acc[item.subject].push(item);
    return acc;
  }, {} as Record<string, VaultItem[]>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#c0c0c0]">
        <Loader2 className="animate-spin text-gray-600 mb-2" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Accessing Memory...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans overflow-hidden" style={{ minWidth: '450px' }}>
      {/* Toolbar */}
      <div className="flex gap-1 p-1 border-b border-gray-400 mb-2 bg-[#d4d0c8] select-none">
        <div className="text-[10px] px-2 py-1 border-r border-gray-400 font-bold flex items-center gap-1">
          <Clock size={12} /> HISTORY
        </div>
        <div className="text-[10px] px-2 py-1 text-gray-500 italic">
          {items.length} records found in Vault
        </div>
      </div>

      <div className="flex-1 p-2 overflow-hidden flex flex-col">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <Folder size={48} className="text-gray-400 mb-4" />
            <p className="text-sm font-bold text-gray-700">The Vault is empty.</p>
            <p className="text-[10px] mt-1 uppercase tracking-tighter text-gray-500">Analyze a PDF to create a memory.</p>
          </div>
        ) : (
          <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white overflow-auto custom-scrollbar shadow-[inset_1px_1px_#000]">
            <table className="w-full border-collapse select-none" style={{ tableLayout: 'fixed', minWidth: '480px' }}>
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="exp-th" style={{ width: '60%' }}>NAME</th>
                  <th className="exp-th" style={{ width: '80px' }}>DATE</th>
                  <th className="exp-th text-center" style={{ width: '110px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {Object.entries(grouped).map(([subject, subjectItems]) => (
                  <React.Fragment key={subject}>
                    {/* Subject Group Header */}
                    <tr className="bg-[#d4d0c8]">
                      <td colSpan={3} className="exp-td border-b border-gray-400 px-2 py-1">
                        <div className="flex items-center gap-1">
                          <Folder size={10} className="text-yellow-600 fill-current" />
                          <span className="text-[9px] font-bold uppercase text-gray-800">{subject}</span>
                          <span className="text-[9px] text-gray-500">({subjectItems.length})</span>
                        </div>
                      </td>
                    </tr>
                    {/* Item Rows */}
                    {subjectItems.map((item) => (
                      <tr 
                        key={item.id}
                        onClick={() => router.push(`/desktop/studyai?id=${item.id}`)}
                        className="hover:bg-[#000080] hover:text-white cursor-pointer group h-[24px] border-b border-gray-100"
                      >
                        <td className="exp-td pr-4">
                          <div className="flex items-center gap-2 overflow-hidden px-2">
                            <FileText size={12} className="shrink-0 group-hover:text-blue-200 text-blue-700" />
                            <span className="truncate text-[10px] font-bold py-1" title={item.title}>{item.title}</span>
                          </div>
                        </td>
                        <td className="exp-td border-l border-gray-100 group-hover:border-blue-900/10">
                          <div className="text-[9px] font-mono px-3">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="exp-td border-l border-gray-100 group-hover:border-blue-900/10 px-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 h-full">
                            <button 
                              onClick={() => router.push(`/desktop/studyai?id=${item.id}`)}
                              className="win95-pro-btn group-hover:bg-[#c0c0c0] group-hover:text-black flex items-center justify-center gap-1"
                            >
                              <ExternalLink size={9} className="shrink-0" /> OPEN
                            </button>
                            <button 
                              onClick={() => handleDelete(window.event as any, item.id)}
                              className="win95-pro-btn text-red-800 group-hover:bg-[#c0c0c0] group-hover:text-red-900 flex items-center justify-center gap-1"
                            >
                              <Trash2 size={9} className="shrink-0" /> DEL
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .exp-th {
          background: #c0c0c0;
          font-size: 8px;
          padding: 3px 8px;
          font-weight: bold;
          color: #000;
          border-right: 1px solid #808080;
          border-left: 1px solid #fff;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #808080;
          box-shadow: inset -1px -1px 0px #404040, inset 1px 1px 0px #dfdfdf;
          white-space: nowrap;
          text-align: left;
        }
        .exp-td {
          white-space: nowrap;
          padding: 0;
          vertical-align: middle;
          overflow: hidden;
        }
        .win95-pro-btn {
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          font-size: 7.5px;
          font-weight: bold;
          padding: 0 4px;
          color: #000;
          min-width: 48px;
          height: 16px;
          text-align: center;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: normal;
        }
        .win95-pro-btn:active {
          border-top: 2px solid #404040;
          border-left: 2px solid #404040;
          border-right: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: translate(1px, 1px);
        }
      `}</style>

      {/* Footer Status Bar */}
      <div className="status-bar win95 px-2 py-0 border-2 border-gray-400! h-[24px] flex items-center shadow-[inset_1px_1px_#0a0a0a]">
        <span className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">
          System Memory: Standard Performance
        </span>
      </div>
    </div>
  );
}
