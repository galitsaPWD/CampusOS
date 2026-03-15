"use client";

import React, { useEffect, useState, useRef } from "react";
import { getProfile, updateProfile } from "@/app/actions/user";
import { Palette, User, Loader2, Save, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageCropper from "@/components/ImageCropper";
import MessageBox from "@/components/MessageBox";

// ─── Inline Win98 style tokens ──────────────────────────────────────────────
const S = {
  page: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    background: "#c0c0c0",
    fontFamily: "'MS Sans Serif', 'Segoe UI', sans-serif",
    fontSize: "11px",
    color: "#000",
    overflow: "hidden",
  },
  form: { display: "flex", flexDirection: "column" as const, height: "100%", overflow: "hidden" },
  tabBar: { display: "flex", alignItems: "flex-end", padding: "6px 6px 0 6px", gap: "2px", background: "#c0c0c0" },
  tabBtn: (active: boolean): React.CSSProperties => ({
    padding: "3px 14px",
    height: "22px",
    background: "#c0c0c0",
    border: "1px solid #808080",
    borderBottom: active ? "none" : "1px solid #808080",
    borderTop: "2px solid " + (active ? "#ffffff" : "#c0c0c0"),
    borderLeft: "1px solid " + (active ? "#ffffff" : "#808080"),
    borderRight: "1px solid " + (active ? "#808080" : "#808080"),
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: active ? "bold" : "normal",
    cursor: "pointer",
    position: "relative",
    bottom: active ? "-1px" : 0,
    zIndex: active ? 2 : 1,
    marginBottom: active ? 0 : undefined,
    boxSizing: "border-box" as const,
  }),
  tabBody: {
    flex: 1,
    margin: "0 6px 6px 6px",
    padding: "12px",
    background: "#c0c0c0",
    border: "1px solid",
    borderColor: "#808080 #ffffff #ffffff #808080",
    borderTop: "1px solid #808080",
    overflowY: "auto" as const,
    zIndex: 1,
  },
  fieldset: {
    border: "1px solid",
    borderColor: "#808080 #ffffff #ffffff #808080",
    padding: "10px 12px 12px 12px",
    marginBottom: "12px",
    background: "#c0c0c0",
  },
  legend: {
    padding: "0 4px",
    fontSize: "11px",
    fontWeight: "bold",
    fontFamily: "inherit",
    background: "#c0c0c0",
  },
  label: { fontSize: "11px", fontFamily: "inherit", display: "block", marginBottom: "4px" },
  input: {
    width: "100%",
    height: "24px",
    background: "#ffffff",
    border: "2px solid",
    borderColor: "#808080 #ffffff #ffffff #808080",
    boxShadow: "inset 1px 1px 0 #0a0a0a",
    padding: "0 4px",
    fontSize: "11px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  select: {
    width: "100%",
    height: "24px",
    background: "#ffffff",
    border: "2px solid",
    borderColor: "#808080 #ffffff #ffffff #808080",
    boxShadow: "inset 1px 1px 0 #0a0a0a",
    padding: "0 4px",
    fontSize: "11px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  hint: { fontSize: "10px", color: "#595959", marginTop: "4px", fontFamily: "inherit" },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "6px",
    padding: "6px 8px",
    borderTop: "1px solid #808080",
    background: "#c0c0c0",
  },
};

function W98Button({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        height: "23px",
        minWidth: "75px",
        padding: "0 10px",
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: pressed
          ? "#808080 #ffffff #ffffff #808080"
          : "#ffffff #808080 #808080 #ffffff",
        boxShadow: pressed ? "inset 1px 1px 0 #0a0a0a" : "none",
        fontFamily: "'MS Sans Serif', sans-serif",
        fontSize: "11px",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        opacity: disabled ? 0.6 : 1,
        transform: pressed ? "translate(1px,1px)" : "none",
        boxSizing: "border-box" as const,
      }}
    >
      {children}
    </button>
  );
}

const WALLPAPER_STYLES: Record<string, React.CSSProperties> = {
  teal:      { backgroundColor: "#008080" },
  night:     { backgroundColor: "#0f1024" },
  clouds:    { backgroundColor: "#3b82f6" },
  circuit:   { backgroundColor: "#1a1a1a" },
  bliss:     { backgroundImage: 'url("/wallpapers/bliss.png")', backgroundSize: "cover", backgroundPosition: "center" },
  vaporwave: { backgroundImage: 'url("/wallpapers/vaporwave.png")', backgroundSize: "cover", backgroundPosition: "center" },
  cyberpunk: { backgroundImage: 'url("/wallpapers/cyberpunk.png")', backgroundSize: "cover", backgroundPosition: "center" },
  office:    { backgroundImage: 'url("/wallpapers/Office Space Bliss.jpg")', backgroundSize: "cover", backgroundPosition: "center" },
  spongebob: { backgroundImage: 'url("/wallpapers/spongebob.jpg.webp")', backgroundSize: "cover", backgroundPosition: "center" },
};

const WALLPAPERS = Object.keys(WALLPAPER_STYLES);

export default function SystemPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>("teal");
  const [customWallpaperBase64, setCustomWallpaperBase64] = useState<string | null>(null);
  const [cropperConfig, setCropperConfig] = useState<{ isOpen: boolean; imageUrl: string }>({ isOpen: false, imageUrl: "" });
  const [selectedTheme, setSelectedTheme] = useState<string>("classic");
  const [msgConfig, setMsgConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false, message: "", type: "success",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    const data = await getProfile();
    setProfile(data);
  };

  useEffect(() => {
    fetchProfile().then(() => {
      const wp = profile?.wallpaper || "teal";
      if (wp.startsWith("data:image")) {
        setCustomWallpaperBase64(wp);
        setSelectedWallpaper("custom");
      } else {
        setSelectedWallpaper(wp);
      }
    });
  }, []);

  useEffect(() => {
    if (profile?.wallpaper) {
      if (profile.wallpaper.startsWith("data:image")) {
        setCustomWallpaperBase64(profile.wallpaper);
        setSelectedWallpaper("custom");
      } else {
        setSelectedWallpaper(profile.wallpaper);
      }
    }
    if (profile?.theme) setSelectedTheme(profile.theme);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    if (selectedWallpaper === "custom" && customWallpaperBase64) {
      formData.set("wallpaper", customWallpaperBase64);
    } else {
      formData.set("wallpaper", selectedWallpaper); // Ensure form matches state
    }
    const result = await updateProfile(formData);
    if (result.success) {
      setMsgConfig({ isOpen: true, message: "System Registry updated. Your personalization settings have been applied.", type: "success" });
      router.refresh();
      await fetchProfile();
    } else {
      setMsgConfig({ isOpen: true, message: "Registry Error: " + (result.error || "The system could not save your profile."), type: "error" });
    }
    setIsSaving(false);
  };

  if (!profile) {
    return (
      <div style={{ ...S.page, alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "#000080" }} />
        <span style={{ fontSize: "11px", fontFamily: "inherit" }}>Loading System Registry...</span>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <form onSubmit={handleSave} style={S.form}>

        {/* ── Tab Bar ── */}
        <div style={S.tabBar}>
          {[{ id: "general", label: "General" }, { id: "appearance", label: "Appearance" }].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={S.tabBtn(activeTab === id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Body ── */}
        <div style={S.tabBody}>

          {/* General Tab */}
          <div style={{ display: activeTab === "general" ? "block" : "none" }}>
            <fieldset style={S.fieldset}>
              <legend style={S.legend}>User Identification</legend>
              <label htmlFor="username" style={S.label}>Student Name:</label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={profile.username}
                style={S.input}
                placeholder="Enter your name"
              />
              <p style={S.hint}>This name appears in your Study reports and Start Menu.</p>
            </fieldset>

            <fieldset style={{ ...S.fieldset, opacity: 0.65 }}>
              <legend style={S.legend}>System Info</legend>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontFamily: "monospace", fontSize: "10px" }}>
                <span>OS VERSION: v1.0.0-Beta</span>
                <span>KERNEL: StudyAI-Core v1.0</span>
                <span>REGISTRY: Supabase/PostgreSQL</span>
              </div>
            </fieldset>
          </div>

          {/* Appearance Tab */}
          <div style={{ display: activeTab === "appearance" ? "block" : "none" }}>
            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Desktop Theme</legend>
              <select name="theme" value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)} style={S.select}>
                <option value="classic">Windows Classic (Blue)</option>
                <option value="midnight">Midnight (Navy)</option>
                <option value="forest">Forest (Dark Green)</option>
                <option value="matrix">Matrix (System Black)</option>
              </select>
              <p style={S.hint}>Changes window title bars and system UI color.</p>
            </fieldset>

            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Wallpaper Preset</legend>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontFamily: "inherit" }}>Select a preset or upload your own:</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080"; }}
                  onMouseUp={(e) => { e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff"; }}
                >
                  <Upload size={10} />
                  Upload Custom
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        if (file.type === "image/gif") {
                          // Bypass cropper for GIFs so we don't destroy the animation
                          setCustomWallpaperBase64(result);
                          setSelectedWallpaper("custom");
                        } else {
                          setCropperConfig({ isOpen: true, imageUrl: result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                
                {/* Custom Wallpaper Option (shows if uploaded) */}
                {customWallpaperBase64 && (
                  <label
                    style={{ display: "flex", flexDirection: "column", gap: "3px", cursor: "pointer", width: "100%" }}
                    onClick={() => setSelectedWallpaper("custom")}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "54px",
                        border: "2px solid",
                        borderColor: selectedWallpaper === "custom" ? "#000080" : "#808080",
                        outline: selectedWallpaper === "custom" ? "1px solid #000080" : "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        backgroundImage: `url(${customWallpaperBase64})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <span style={{ fontSize: "9px", fontWeight: selectedWallpaper === "custom" ? "bold" : "normal", textTransform: "uppercase", textAlign: "center", fontFamily: "inherit", color: selectedWallpaper === "custom" ? "#000080" : "#000" }}>
                      CUSTOM UPLOAD
                    </span>
                  </label>
                )}

                {WALLPAPERS.map((wp) => {
                  const isSelected = selectedWallpaper === wp;
                  return (
                  <label
                    key={wp}
                    style={{ display: "flex", flexDirection: "column", gap: "3px", cursor: "pointer", width: "100%" }}
                    onClick={() => setSelectedWallpaper(wp)}
                  >
                    <input
                      type="radio"
                      name="wallpaper"
                      value={wp}
                      checked={isSelected}
                      onChange={() => setSelectedWallpaper(wp)}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: "100%",
                        height: "54px",
                        border: "2px solid",
                        borderColor: isSelected ? "#000080" : "#808080",
                        outline: isSelected ? "1px solid #000080" : "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        ...WALLPAPER_STYLES[wp],
                      }}
                    />
                    <span style={{ fontSize: "9px", fontWeight: isSelected ? "bold" : "normal", textTransform: "uppercase", textAlign: "center", fontFamily: "inherit", color: isSelected ? "#000080" : "#000" }}>
                      {wp}
                    </span>
                  </label>);
                })}
              </div>
            </fieldset>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <W98Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
            Apply
          </W98Button>
          <W98Button onClick={() => router.push("/desktop")}>
            <X size={10} /> Cancel
          </W98Button>
        </div>
      </form>

      <MessageBox
        isOpen={msgConfig.isOpen}
        title={msgConfig.type === "success" ? "System Properties" : "System Error"}
        message={msgConfig.message}
        type={msgConfig.type}
        onClose={() => setMsgConfig((p) => ({ ...p, isOpen: false }))}
      />

      <ImageCropper
        isOpen={cropperConfig.isOpen}
        imageUrl={cropperConfig.imageUrl}
        onClose={() => setCropperConfig({ isOpen: false, imageUrl: "" })}
        onCropComplete={(croppedBase64) => {
          setCustomWallpaperBase64(croppedBase64);
          setSelectedWallpaper("custom");
          setCropperConfig({ isOpen: false, imageUrl: "" });
        }}
      />
    </div>
  );
}
