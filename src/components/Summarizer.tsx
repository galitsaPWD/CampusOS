"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { summarizePdf } from "@/app/actions/summarizer";
import { useSearchParams } from "next/navigation";
import { getVaultItemById } from "@/app/actions/vault";

interface StudyAIResult {
  subject: string;
  summary: string;
  keyConcepts: Array<{ term: string; definition: string; whyItMatters: string }>;
  examQuestions: Array<{ 
    question: string; 
    type: string; 
    probabilityScore: number; 
    difficulty: string; 
    hint: string 
  }>;
  keyTerms: Array<{ term: string; definition: string }>;
}

export default function Summarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "summarizing" | "done" | "error">("idle");
  const [summaryData, setSummaryData] = useState<StudyAIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFromVault, setIsFromVault] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      loadFromVault(id);
    }
  }, [searchParams]);

  const loadFromVault = async (id: string) => {
    setStatus("summarizing");
    setError(null);
    try {
      const data = await getVaultItemById(id);
      setSummaryData({
        subject: data.subject,
        summary: data.summary,
        keyConcepts: data.keyConcepts,
        examQuestions: data.examQuestions,
        keyTerms: data.keyTerms
      });
      setIsFromVault(true);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("Failed to load study guide from Vault.");
      setStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("idle");
      setError(null);
      setIsFromVault(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setIsFromVault(false);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      setStatus("summarizing");
      const result = await summarizePdf(formData);
      
      if (result.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setSummaryData(result.summary);
        setIsFromVault(!!result.fromVault);
        setStatus("done");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the server. Please check your connection.");
      setStatus("error");
    }
  };

  const getBadgeColor = (score: number) => {
    if (score >= 70) return "bg-[#dcfce7] text-[#166534]"; // Green
    if (score >= 40) return "bg-[#fef9c3] text-[#854d0e]"; // Yellow
    return "bg-[#f3f4f6] text-[#374151]"; // Gray
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans">
      {/* Tab Controls (Classic Win95 Style) */}
      <div className="flex gap-1 mb-4 p-1">
        <button className="border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 px-4 py-1 bg-[#c0c0c0] text-[11px] font-bold">
          Upload
        </button>
        <button className="border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 px-4 py-1 bg-[#c0c0c0] text-[11px] opacity-70 cursor-not-allowed">
          Templates
        </button>
      </div>

      <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white bg-white p-6 overflow-auto custom-scrollbar">
        {status === "idle" && !file && (
          <div 
            className="h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="text-gray-400 mb-4" size={48} />
            <p className="text-sm font-bold text-gray-700">Select PDF Study Material</p>
            <p className="text-[11px] text-gray-500 mt-2">Maximum file size: 10MB</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf" 
              onChange={handleFileChange}
            />
          </div>
        )}

        {(file || status === "error") && status !== "done" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
             {status === "error" ? (
               <div className="flex flex-col items-center gap-3 text-red-600 bg-red-50 p-4 border-2 border-red-200 win95 max-w-[400px]">
                 <AlertCircle size={32} />
                 <p className="text-[11px] font-bold text-center leading-relaxed">{error}</p>
                 <button 
                    onClick={() => { setStatus("idle"); setFile(null); }}
                    className="mt-2 border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 bg-[#c0c0c0] px-4 py-1 text-[11px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white text-black"
                  >
                    Try Again
                  </button>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-3 p-4 border-2 border-gray-200 bg-gray-50 win95 select-none">
                   <FileText size={32} className="text-blue-600" />
                   <div className="text-left">
                     <p className="text-sm font-bold truncate max-w-[200px]">{file?.name}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{(file?.size || 0) / 1024 / 1024 > 0 ? ((file?.size || 0) / 1024 / 1024).toFixed(2) : "0"} MB — Ready</p>
                   </div>
                 </div>
                 
                 {status === "idle" && (
                   <button 
                     onClick={handleUpload}
                     className="mt-4 border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 bg-[#c0c0c0] px-6 py-2 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white font-bold text-[12px] flex items-center gap-2"
                   >
                     <Sparkles size={16} />
                     START SUMMARIZING
                   </button>
                 )}

                 {(status === "uploading" || status === "summarizing") && (
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                     <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-800">
                       {status === "uploading" ? "Broadcasting Data..." : "AI Engine Analyzing PDF..."}
                     </p>
                   </div>
                 )}
               </>
             )}
          </div>
        )}

        {status === "done" && summaryData && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2 mb-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={18} />
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  {isFromVault ? "Retrieved from Memory" : "Analysis Complete"} — {summaryData.subject}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>

            {/* 1. Summary Section */}
            <section className="space-y-3">
              <h3 className="text-[9px] font-semibold text-[#4f46e5] uppercase tracking-[1px] flex items-center gap-2">
                <span className="text-[16px]">📄</span>
                SUMMARY
              </h3>
              <div className="p-6 bg-gray-50 border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white text-sm leading-relaxed text-gray-800">
                {summaryData.summary}
              </div>
            </section>

            {/* 2. Key Concepts Section */}
            <section className="space-y-3">
              <h3 className="text-[9px] font-semibold text-[#4f46e5] uppercase tracking-[1px] flex items-center gap-2">
                <span className="text-[16px]">🧠</span>
                KEY CONCEPTS
              </h3>
              <div className="grid gap-4">
                {summaryData.keyConcepts.map((item, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-blue-500 bg-[#f0f0ff] shadow-sm">
                    <p className="text-xs font-bold text-blue-900 mb-1">{item.term}</p>
                    <p className="text-[11px] text-gray-700 leading-normal">{item.definition}</p>
                    <p className="text-[10px] text-blue-600 italic mt-1.5">— {item.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t-2 border-gray-100 my-8" />

            {/* 3. Exam Questions Section */}
            <section className="space-y-3">
              <h3 className="text-[9px] font-semibold text-[#4f46e5] uppercase tracking-[1px] flex items-center gap-2">
                <span className="text-[16px]">❓</span>
                POSSIBLE EXAM QUESTIONS
              </h3>
              <div className="space-y-4">
                {summaryData.examQuestions.map((q, idx) => (
                  <div key={idx} className="border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="text-xs font-bold leading-relaxed">{q.question}</p>
                      <span className={`text-[9px] px-2 py-0.5 font-bold uppercase whitespace-nowrap border border-black/10 ${getBadgeColor(q.probabilityScore)}`}>
                        {q.probabilityScore}% Match
                      </span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Type: {q.type}</span>
                      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Difficulty: {q.difficulty}</span>
                    </div>
                    <div className="mt-3 px-3 py-2 bg-yellow-50 border-l-2 border-yellow-400 opacity-0 group-hover:opacity-100 cursor-help transition-opacity">
                      <p className="text-[10px] text-yellow-800 underline decoration-yellow-200 decoration-dotted underline-offset-4">💡 Hint: {q.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Key Terms Section */}
            <section className="space-y-3">
              <h3 className="text-[9px] font-semibold text-[#4f46e5] uppercase tracking-[1px] flex items-center gap-2">
                <span className="text-[16px]">📖</span>
                KEY TERMS
              </h3>
              <div className="bg-[#f8f9fa] p-4 text-[11px] columns-1 md:columns-2 gap-8 border border-gray-200">
                {summaryData.keyTerms.map((term, idx) => (
                  <div key={idx} className="mb-4 break-inside-avoid text-gray-700">
                    <span className="text-blue-800 font-bold">{term.term}</span>: {term.definition}
                  </div>
                ))}
              </div>
            </section>
            
            <div className="mt-12 flex gap-4 pt-6 border-t border-gray-200">
               <button 
                 onClick={() => { setFile(null); setStatus("idle"); setSummaryData(null); }}
                 className="border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 bg-[#c0c0c0] px-6 py-2 text-[11px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
               >
                 &lt;&lt; NEW STUDY GUIDE
               </button>
               <button className="border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 bg-[#c0c0c0] px-6 py-2 text-[11px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white opacity-50 cursor-not-allowed">
                 PRINT REPORT
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar (Classic Win95) */}
      <div className="mt-2 status-bar win95 px-2 py-0 border-2 border-gray-400! h-[24px] flex items-center shadow-[inset_1px_1px_#0a0a0a]">
        <span className="text-[10px] text-gray-700 font-bold uppercase tracking-tighter">
          {status === "idle" ? "Ready" : status === "uploading" ? "Broadcasting data..." : status === "summarizing" ? (isFromVault ? "Accessing system memory..." : "AI studying PDF content...") : status === "error" ? "Process failed" : "Analysis Complete"}
        </span>
      </div>
    </div>
  );
}
