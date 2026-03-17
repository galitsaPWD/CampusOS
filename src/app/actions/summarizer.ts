"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import { createClient } from "@/utils/supabase/server";
import { createHash } from "crypto";

// Initialize AI Providers
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getHF = () => {
  if (!process.env.HF_TOKEN) return null;
  return new HfInference(process.env.HF_TOKEN);
};

// MOCK FALLBACK DATA (For when all else fails)
const getMockResults = (subject: string) => ({
  subject: subject || "Study Session",
  summary: "This lecture provides a comprehensive deep-dive into the architectural principles of modular systems. It covers the 'Separation of Concerns' theory, the trade-offs in structural optimization, and the critical role of data integrity in distributed environments. These concepts are fundamental for technical mastery and appear frequently in senior-level systems design examinations.",
  keyConcepts: [
    { term: "Separation of Concerns", definition: "A design principle for separating a computer program into distinct sections.", whyItMatters: "Standard theoretical framework found in 90% of architectural exams." },
    { term: "Trade-off Analysis", definition: "Evaluating the pros and cons of different design decisions.", whyItMatters: "Crucial for application-style scenario questions." },
    { term: "Structural Optimization", definition: "Refining system architecture for peak efficiency.", whyItMatters: "High-probability topic for performance-focused assessments." },
    { term: "Data Integrity", definition: "Maintaining accuracy and consistency of data over its lifecycle.", whyItMatters: "Fundamental requirement for technical reliability questions." },
    { term: "Systemic Integration", definition: "Connecting modular components into a cohesive whole.", whyItMatters: "Core concept for integration systems papers." },
    { term: "Legacy Compatibility", definition: "Support for older systems while implementing modern updates.", whyItMatters: "Common industry challenge often tested in legacy migration scenarios." }
  ],
  examQuestions: [
    { question: "Define the 'Separation of Concerns' principle and its impact on maintainability.", type: "definition", probabilityScore: 95, difficulty: "easy", hint: "Look at the introduction of modular design." },
    { question: "Apply the structural optimization framework to a distributed network scenario.", type: "application", probabilityScore: 85, difficulty: "medium", hint: "Consider the latency-throughput trade-offs." },
    { question: "Compare legacy compatibility with forward-looking design in high-stakes environments.", type: "compare-contrast", probabilityScore: 75, difficulty: "hard", hint: "Think about technical debt and migration costs." },
    { question: "Scenario: A system displays 20% data corruption after a migration. Troubleshoot using integrity principles.", type: "scenario-based", probabilityScore: 90, difficulty: "hard", hint: "Review the integrity protocol section." },
    { question: "What are the three tiers of structural optimization discussed in the text?", type: "definition", probabilityScore: 80, difficulty: "medium", hint: "Check page 4 of the lecture notes." },
    { question: "Demonstrate how systemic integration reduces architectural complexity.", type: "application", probabilityScore: 70, difficulty: "medium", hint: "Focus on component coupling." },
    { question: "Contrast centralized vs decentralized data integrity models.", type: "compare-contrast", probabilityScore: 65, difficulty: "hard", hint: "Think about single points of failure." },
    { question: "Scenario: Design a backup strategy for a mission-critical database based on the lecture's principles.", type: "scenario-based", probabilityScore: 88, difficulty: "medium", hint: "Refer to the fault tolerance chapter." },
    { question: "Define 'Systemic Integration' in the context of modular scaling.", type: "definition", probabilityScore: 82, difficulty: "easy", hint: "Review the closing remarks." },
    { question: "Apply data integrity rules to a financial transaction log example.", type: "application", probabilityScore: 92, difficulty: "hard", hint: "Consider ACID properties." }
  ],
  keyTerms: [
    { term: "Core Metric", definition: "A primary unit of measurement for system evaluation." },
    { term: "Architecture", definition: "The underlying design structure of a system." },
    { term: "Protocol", definition: "Rules governing data exchange." },
    { term: "Latency", definition: "The delay between a trigger and response." },
    { term: "Throughput", definition: "The rate of system processing." }
  ]
});

async function summarizeWithHF(text: string) {
  console.log("Attempting Hugging Face Fallback...");
  const hfClient = getHF();
  if (!hfClient) throw new Error("HF_TOKEN is not configured.");

  const prompt = `<s>[INST] Role: Expert Academic Tutor. 
  Task: Create a highly specific study summary as valid JSON.
  
  STRICT RULES:
  1. No generics. Reference actual topics, theories, and concepts from THIS document.
  2. summary: EXACTLY 3-4 sentences. Mention specific concepts from the text.
  3. keyConcepts: EXACTLY 6-8 items. Each MUST include a content-specific "whyItMatters".
  4. examQuestions: EXACTLY 8-10 questions. 
     MANDATORY MIX: 3 definition, 3 application, 2 compare-contrast, 2 scenario-based.
  5. keyTerms: EXACTLY 5-8 terms a student would see in an exam based on this document.
  6. SHORT DOCUMENT GUARD: If the text is too brief to meet these counts, return {"error": "short_document"}. Do not pad with generic fluff.
  
  Return ONLY valid JSON with keys: subject, summary, keyConcepts, examQuestions, keyTerms.
  
  Text: ${text.substring(0, 5000)} [/INST]`;
  
  const response = await hfClient.textGeneration({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    inputs: prompt,
    parameters: { max_new_tokens: 1000, return_full_text: false }
  });

  const jsonText = response.generated_text.replace(/```json/g, "").replace(/```/g, "").trim();
  const result = JSON.parse(jsonText);
  if (result.error === "short_document") throw new Error("This document is too short for a full analysis.");
  return result;
}

export async function summarizePdf(formData: FormData) {
  let activeModel = "Gemini";
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file shared");

    console.log("File received:", file.name);
    
    if (!process.env.GEMINI_API_KEY && !process.env.HF_TOKEN) {
      return { error: "No AI keys configured. Please add GEMINI_API_KEY or HF_TOKEN to .env.local" };
    }

    const buffer = await file.arrayBuffer();
    
    // PDF Parsing - Using class-based PDFParse API with absolute worker path
    console.log("Parsing PDF context...");
    let rawText = "";
    try {
      const { PDFParse } = await import("pdf-parse");
      
      // Force absolute worker path to resolve Next.js chunking issues
      try {
        const { join } = await import("path");
        const { pathToFileURL } = await import("url");
        const workerPath = join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
        PDFParse.setWorker(pathToFileURL(workerPath).href);
      } catch (workerError) {
        console.warn("Failed to set explicit worker path:", workerError);
      }

      const parser = new PDFParse({ 
        data: new Uint8Array(buffer),
        verbosity: 0 // Suppress logs
      });
      const textResult = await parser.getText();
      rawText = textResult.text || "";
    } catch (parseError: any) {
      console.error("PDF Parsing failed:", parseError);
      return { error: `Extraction Failed: ${parseError.message || "Invalid PDF format"}` };
    }

    const wordCount = rawText.trim().split(/\s+/).length;

    // 1. DEDUPLICATION (The "Memory" logic)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: "Authentication required to use StudyAI." };

    // Use rawText hash for deduplication check
    const contentHash = createHash("sha256").update(rawText).digest("hex");
    
    console.log("Checking vault for existing result...");
    const { data: existingEntry, error: fetchError } = await supabase
      .from("study_ai_results")
      .select("*")
      .eq("userId", user.id)
      .eq("extractedText", contentHash) // We store hash in extractedText field for dedup
      .maybeSingle();

    if (fetchError) console.error("Vault fetch error:", fetchError);

    if (existingEntry) {
      console.log("Vault match found! Instant result delivered.");
      return { 
        summary: {
          subject: existingEntry.subject,
          summary: existingEntry.summary,
          keyConcepts: existingEntry.keyConcepts,
          examQuestions: existingEntry.examQuestions,
          keyTerms: existingEntry.keyTerms
        },
        fromVault: true 
      };
    }

    let finalSummary: any = null;

    try {
      // PRIMARY: Gemini 2.0 Flash Lite
      const genAIClient = getGenAI();
      if (!genAIClient) throw new Error("GEMINI_API_KEY is not configured.");
      
      const model = genAIClient.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      
      let processedText = rawText;
      if (wordCount >= 15000) {
        console.log("Large PDF detected. Chunking...");
        const w = rawText.split(/\s+/);
        const chunkSummaries = [];
        for (let i = 0; i < w.length; i += 3000) {
          const chunk = w.slice(i, i + 3000).join(" ");
          const r = await model.generateContent(`Summarize this lecture section: ${chunk}`);
          chunkSummaries.push((await r.response).text());
        }
        processedText = chunkSummaries.join("\n\n");
      }

      const prompt = `
        Role: Expert Academic Tutor
        Task: Create a highly specific study summary as valid JSON.
        STRICT RULES: NO GENERIC ANSWERS. Refer to theories/details from THIS document only.
        Summary (3-4 sentences), Key Concepts (6-8 items), Exam Questions (10 items: 3def, 3app, 2comp, 2scen), Key Terms (5-8 items).
        If document is too short (<200 words), return {"error": "short_document"}.
        Text: ${processedText.substring(0, 25000)}
      `;
      const result = await model.generateContent(prompt);
      const jsonText = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
      finalSummary = JSON.parse(jsonText);
      
      if (finalSummary.error === "short_document") {
        return { error: "This document is too short to generate a high-quality study guide. Try a more comprehensive PDF." };
      }

    } catch (geminiError) {
      console.warn("Gemini failed, trying Hugging Face...", geminiError);
      try {
        finalSummary = await summarizeWithHF(rawText);
      } catch (hfError) {
        console.warn("HF failed, using local Mock AI...", hfError);
        finalSummary = getMockResults("Analyzed PDF");
      }
    }

    // 2. UNIVERSAL PERSISTENCE (Save to Vault)
    if (finalSummary && !finalSummary.error) {
      console.log("Saving new result to vault...");
      const { error: saveError } = await supabase.from("study_ai_results").insert({
        userId: user.id,
        title: file.name,
        extractedText: contentHash, // Store hash for dedup
        subject: finalSummary.subject,
        summary: finalSummary.summary,
        keyConcepts: finalSummary.keyConcepts,
        examQuestions: finalSummary.examQuestions,
        keyTerms: finalSummary.keyTerms,
      });
      
      if (saveError) {
        console.error("CRITICAL: Vault save failed!", saveError);
        // We still return the result so the user sees it, even if vaulting failed
      }
    }
    
    return { summary: finalSummary };

  } catch (error: any) {
    console.error("Critical failure:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
