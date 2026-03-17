"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, FileText, StickyNote } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("campus_notes_v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) {
          setActiveNoteId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("campus_notes_v3", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const createNote = () => {
    const newId = crypto.randomUUID();
    const newNote: Note = {
      id: newId,
      title: "New Note",
      content: "",
      updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
  };

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const startRenaming = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setTempTitle(currentTitle);
  };

  const saveRename = () => {
    if (!renamingId) return;
    setNotes(prev => prev.map(n => n.id === renamingId ? { ...n, title: tempTitle || "Untitled" } : n));
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveRename();
    if (e.key === "Escape") setRenamingId(null);
  };

  const updateActiveNote = (content: string) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content, updatedAt: Date.now() } : n));
  };

  if (!isLoaded) return null;

  return (
    <div className="flex h-full bg-[#c0c0c0] font-sans overflow-hidden select-none border-t border-l border-white shadow-[inset_-1px_-1px_#000]">
      {/* Sidebar - Controlled width and clean header */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-[#808080] bg-[#dfdfdf]">
        <div className="p-1 px-2 border-b border-[#808080] bg-[#c0c0c0] flex items-center justify-between shadow-[inset_1px_1px_#dfdfdf]">
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">Notes</span>
          <div 
            role="button"
            onClick={createNote}
            className="w-4 h-4 flex items-center justify-center bg-[#c0c0c0] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-inset active:p-[1px] hover:bg-[#d0d0d0] cursor-default"
            title="New Note"
          >
            <Plus size={10} className="text-black" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar bg-white shadow-[inset_1px_1px_#808080]">
          {notes.length === 0 ? (
            <div className="p-4 text-center opacity-40 flex flex-col items-center gap-2">
              <StickyNote size={18} />
              <p className="text-[9px] leading-tight font-bold uppercase text-black">Empty</p>
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                onDoubleClick={(e) => startRenaming(e, note.id, note.title)}
                className={`
                  flex items-center gap-1.5 p-1 mb-0.5 cursor-default group border border-transparent
                  ${activeNoteId === note.id ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}
                `}
              >
                <div className="flex-shrink-0">
                  <FileText size={10} className={activeNoteId === note.id ? 'text-white' : 'text-blue-800'} />
                </div>
                <div className="flex-1 min-w-0">
                  {renamingId === note.id ? (
                    <input
                      autoFocus
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={handleRenameKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[10px] bg-white text-black border border-blue-500 outline-none px-0.5"
                    />
                  ) : (
                    <>
                      <div className={`text-[10px] font-bold truncate leading-none ${activeNoteId === note.id ? 'text-white' : 'text-black'}`}>
                        {note.title || "Untitled"}
                      </div>
                      <div className={`text-[8px] truncate mt-0.5 ${activeNoteId === note.id ? 'text-white/60' : 'text-gray-500'}`}>
                        {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}
                </div>
                {renamingId !== note.id && (
                  <div 
                    role="button"
                    onClick={(e) => deleteNote(e, note.id)}
                    className={`
                      opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center hover:bg-red-600 hover:text-white transition-opacity
                      ${activeNoteId === note.id ? 'text-white' : 'text-gray-400'}
                    `}
                  >
                    <Trash2 size={8} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor - Notepad Classic Theme */}
      <div className="flex-1 flex flex-col bg-white">
        {activeNote ? (
          <div className="flex flex-col h-full">
            <div className="flex gap-4 px-2 py-0.5 bg-[#c0c0c0] text-[11px] font-sans border-b border-[#808080] select-none flex-shrink-0 shadow-[inset_1px_1px_#dfdfdf]">
              <div 
                className="hover:bg-[#000080] hover:text-white px-1 cursor-default"
                onClick={(e) => startRenaming(e as any, activeNote.id, activeNote.title)}
              >
                Rename
              </div>
              <div className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</div>
              <div className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Format</div>
              <div className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</div>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateActiveNote(e.target.value)}
              className="flex-1 p-3 resize-none outline-none text-[13px] font-mono bg-white text-black leading-relaxed selection:bg-[#000080] selection:text-white caret-black"
              spellCheck={false}
              placeholder="Start typing your school notes..."
              autoFocus
            />
            <div className="bg-[#c0c0c0] border-t border-[#808080] px-2 py-1 text-[10px] text-gray-700 font-sans flex justify-between flex-shrink-0">
              <span className="font-bold uppercase tracking-wider">{activeNote.content.length} CHARS</span>
              <span className="truncate ml-4 max-w-[200px]">{activeNote.title}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#dfdfdf] border-l border-white">
            <div className="w-16 h-16 opacity-10 mb-4 scale-icons">
               <FileText size={64} />
            </div>
            <button 
              onClick={createNote}
              className="px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-inset text-[11px] font-bold hover:bg-[#d8d8d8]"
            >
              CREATE NEW NOTE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
