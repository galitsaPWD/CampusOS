"use client";

import React, { useEffect, useState } from "react";
import { getVaultItems } from "@/app/actions/vault";
import { Loader2 } from "lucide-react";

interface FlashCard {
  term: string;
  definition: string;
}

interface Deck {
  id: string;
  subject: string;
  title: string;
  cards: FlashCard[];
}

const S = {
  page: { height: "100%", display: "flex", flexDirection: "column" as const, background: "#c0c0c0", fontFamily: "'MS Sans Serif', sans-serif", fontSize: "11px", color: "#000", overflow: "hidden" },
  btn: (pressed = false): React.CSSProperties => ({
    height: "23px", minWidth: "75px", padding: "0 10px", background: "#c0c0c0",
    border: "2px solid", borderColor: pressed ? "#808080 #fff #fff #808080" : "#fff #808080 #808080 #fff",
    boxShadow: pressed ? "inset 1px 1px 0 #0a0a0a" : "none", fontFamily: "inherit", fontSize: "11px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
  }),
  sunken: { border: "2px solid", borderColor: "#808080 #fff #fff #808080", boxShadow: "inset 1px 1px 0 #0a0a0a" },
};

export default function CardDeckPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const items = await getVaultItems();
        const built: Deck[] = (items || [])
          .filter((i: any) => i.keyTerms && i.keyConcepts)
          .map((i: any) => {
            const cards: FlashCard[] = [
              ...(i.keyTerms || []).map((t: any) => ({ term: t.term, definition: t.definition })),
              ...(i.keyConcepts || []).map((c: any) => ({ term: c.term, definition: `${c.definition} — ${c.whyItMatters}` })),
            ];
            return { id: i.id, subject: i.subject || "Unknown", title: i.title || i.subject, cards };
          })
          .filter((d: Deck) => d.cards.length > 0);
        setDecks(built);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const currentCard = activeDeck?.cards[cardIdx];

  if (loading) {
    return (
      <div style={{ ...S.page, alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "#000080" }} />
        <span>Loading Flashcard Decks...</span>
      </div>
    );
  }

  if (!activeDeck) {
    return (
      <div style={S.page}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #808080", fontWeight: "bold" }}>
          🃏 CardDeck — Select a Study Deck
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
          {decks.length === 0 ? (
            <div style={{ ...S.sunken, background: "#fff", padding: 16, textAlign: "center" }}>
              <p style={{ fontWeight: "bold", marginBottom: 6 }}>No Decks Available</p>
              <p style={{ fontSize: 10, color: "#595959" }}>Upload a PDF in StudyAI first. Your flashcards will automatically appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {decks.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDeck(d); setCardIdx(0); setFlipped(false); }}
                  style={{
                    ...S.sunken, background: "#fff", padding: "8px 12px", cursor: "pointer", textAlign: "left",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 11 }}>{d.title}</div>
                    <div style={{ fontSize: 10, color: "#595959" }}>{d.subject}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#000080", fontWeight: "bold" }}>{d.cards.length} cards</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "4px 8px", borderTop: "1px solid #808080", fontSize: 10, color: "#595959" }}>
          {decks.length} deck(s) available
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{ padding: "8px 10px", borderBottom: "1px solid #808080", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>🃏 {activeDeck.title}</span>
        <button onClick={() => setActiveDeck(null)} style={S.btn()}>← Back</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, gap: 12 }}>
        {/* Progress */}
        <div style={{ fontSize: 10, color: "#595959", fontWeight: "bold" }}>
          Card {cardIdx + 1} of {activeDeck.cards.length}
        </div>

        {/* The Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            width: "100%", maxWidth: 340, minHeight: 160, padding: 20,
            background: flipped ? "#fffff0" : "#fff",
            ...S.sunken,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", textAlign: "center", transition: "background 0.2s",
          }}
        >
          <div style={{ fontSize: 9, color: "#808080", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8 }}>
            {flipped ? "Definition" : "Term"}
          </div>
          <div style={{ fontSize: flipped ? 11 : 13, fontWeight: flipped ? "normal" : "bold", lineHeight: "1.5" }}>
            {flipped ? currentCard?.definition : currentCard?.term}
          </div>
          <div style={{ fontSize: 9, color: "#808080", marginTop: 12 }}>
            Click to {flipped ? "see term" : "reveal definition"}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipped(false); }}
            disabled={cardIdx === 0}
            style={{ ...S.btn(), opacity: cardIdx === 0 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <button
            onClick={() => { setFlipped(false); setCardIdx(Math.floor(Math.random() * activeDeck.cards.length)); }}
            style={S.btn()}
          >
            🔀 Shuffle
          </button>
          <button
            onClick={() => { setCardIdx(Math.min(activeDeck.cards.length - 1, cardIdx + 1)); setFlipped(false); }}
            disabled={cardIdx === activeDeck.cards.length - 1}
            style={{ ...S.btn(), opacity: cardIdx === activeDeck.cards.length - 1 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 340, height: 8, background: "#808080", ...S.sunken }}>
          <div style={{ height: "100%", width: `${((cardIdx + 1) / activeDeck.cards.length) * 100}%`, background: "#000080", transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ padding: "4px 8px", borderTop: "1px solid #808080", fontSize: 10, color: "#595959" }}>
        {activeDeck.subject} — {activeDeck.cards.length} total cards
      </div>
    </div>
  );
}
