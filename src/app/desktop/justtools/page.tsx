"use client";

export default function JustToolsPage() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Win98-style address bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 6px",
        background: "#c0c0c0",
        borderBottom: "2px solid",
        borderColor: "#808080 #ffffff #ffffff #808080",
        fontFamily: "'MS Sans Serif', sans-serif",
        fontSize: "10px",
      }}>
        <span style={{ color: "#444", fontWeight: "bold" }}>Address:</span>
        <div style={{
          flex: 1,
          height: "18px",
          background: "#ffffff",
          border: "2px solid",
          borderColor: "#808080 #ffffff #ffffff #808080",
          display: "flex",
          alignItems: "center",
          padding: "0 4px",
          fontSize: "10px",
          color: "#000080",
          fontFamily: "inherit",
        }}>
          https://justtools-free.vercel.app/
        </div>
        <a
          href="https://justtools-free.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "9px",
            padding: "1px 6px",
            background: "#c0c0c0",
            border: "2px solid",
            borderColor: "#ffffff #808080 #808080 #ffffff",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "#000",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Open ↗
        </a>
      </div>

      {/* iframe */}
      <iframe
        src="https://justtools-free.vercel.app/"
        title="JustTools"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          background: "#fff",
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
