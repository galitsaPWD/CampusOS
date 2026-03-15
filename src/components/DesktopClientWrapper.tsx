"use client";

import React, { useState, useCallback, lazy, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesktopIcon from "@/components/DesktopIcon";
import Taskbar from "@/components/Taskbar";
import RetroWindow from "@/components/Window";
import ContextMenu from "@/components/ContextMenu";
import MessageBox from "@/components/MessageBox";

// ── App Content (direct imports — all client components) ──────────────────────
const StudyAIApp = lazy(() => import("@/app/desktop/studyai/page"));
const VaultApp = lazy(() => import("@/app/desktop/vault/page"));
const SystemApp = lazy(() => import("@/app/desktop/system/page"));
const JustToolsApp = lazy(() => import("@/app/desktop/justtools/page"));
const DownloaderApp = lazy(() => import("@/app/desktop/downloader/page"));
const CatGameApp = lazy(() => import("@/app/desktop/catgame/page"));
const NotesApp = lazy(() => import("@/app/desktop/notes/page"));

// ── App Registry ─────────────────────────────────────────────────────────────
const APP_REGISTRY: Record<string, {
  title: string;
  iconUrl: string;
  component: React.ComponentType<any>;
  width: string;
  height: string;
  locked?: boolean;
}> = {
  studyai: { title: "StudyAI", iconUrl: "/icons/notepad-0.png", component: StudyAIApp, width: "650px", height: "550px" },
  vault: { title: "Vault", iconUrl: "/icons/directory_closed-4.png", component: VaultApp, width: "500px", height: "400px" },
  system: { title: "System", iconUrl: "/icons/settings_gear-0.png", component: SystemApp, width: "400px", height: "360px" },
  notes: { title: "Notes", iconUrl: "/icons/note-1.png", component: NotesApp, width: "400px", height: "300px" },
  justtools: { title: "JustTools", iconUrl: "/icons/computer_explorer-0.png", component: JustToolsApp, width: "760px", height: "540px" },
  carddeck: { title: "CardDeck", iconUrl: "/icons/game_solitaire-0.png", component: StudyAIApp, width: "500px", height: "400px", locked: true },
  quizme: { title: "QuizMe", iconUrl: "/icons/help_book_big-0.png", component: StudyAIApp, width: "500px", height: "400px", locked: true },
  cal: { title: "Cal", iconUrl: "/icons/calendar-0.png", component: StudyAIApp, width: "400px", height: "350px", locked: true },
  downloader: { title: "Game Downloader", iconUrl: "/icons/computer_explorer-0.png", component: DownloaderApp, width: "450px", height: "350px" },
  catgame: { title: "Normal Cat Game", iconUrl: "/icons/catgame-0.png", component: CatGameApp, width: "450px", height: "380px" },
};

const DESKTOP_ICONS = Object.entries(APP_REGISTRY).map(([id, app]) => ({ id, ...app }));

// ── Window State ─────────────────────────────────────────────────────────────
interface WinState {
  id: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

let zCounter = 10;

export default function DesktopClientWrapper({ children: _children, initialProfile }: { children: React.ReactNode, initialProfile: any }) {
  const router = useRouter();
  const [windows, setWindows] = useState<WinState[]>([]);
  const [trashedIcons, setTrashedIcons] = useState<string[]>([]);
  const [trashedPdfs, setTrashedPdfs] = useState<{ id: string; title: string; subject: string }[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: "desktop" | "icon" | "trash" | "trash-item" | "trash-pdf", targetId?: string } | null>(null);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [easterEggMsg, setEasterEggMsg] = useState<{ title: string; text: string; type: "success" | "error" | "info" } | null>(null);
  const [installedApps, setInstalledApps] = useState<string[]>([]);

  // ── Initial Trash State ───────────────────────────────────────────────────
  useEffect(() => {
    // Check if there are trashed PDFs on mount to set the bin icon state
    import("@/app/actions/vault").then(({ getDeletedVaultItems }) => {
      getDeletedVaultItems().then(pdfs => {
        if (pdfs && pdfs.length > 0) {
          setTrashedPdfs(pdfs as any);
        }
      }).catch(e => console.error("Failed to load initial trash state", e));
    });

    // Load installed apps from localStorage
    const stored = localStorage.getItem("campus_installed_apps");
    if (stored) {
      try {
        setInstalledApps(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse installed apps", e);
      }
    }
  }, []);

  const installApp = useCallback((id: string) => {
    setInstalledApps(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("campus_installed_apps", JSON.stringify(next));
      return next;
    });
  }, []);

  const closeApp = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const uninstallApp = useCallback((id: string) => {
    setInstalledApps(prev => {
      const next = prev.filter(appId => appId !== id);
      localStorage.setItem("campus_installed_apps", JSON.stringify(next));
      return next;
    });
    setTrashedIcons(prev => prev.filter(trashId => trashId !== id)); // Ensure it's not in trash either
    closeApp(id);
  }, [closeApp]);

  // ── Open / Focus ──────────────────────────────────────────────────────────
  const openApp = useCallback(async (id: string) => {
    if (APP_REGISTRY[id]?.locked) return;

    // Load trashed PDFs when Trash is opened
    if (id === "trash") {
      try {
        const { getDeletedVaultItems } = await import("@/app/actions/vault");
        const pdfs = await getDeletedVaultItems();
        setTrashedPdfs(pdfs as any);
      } catch (e) {
        console.error("Failed to load deleted PDFs", e);
      }
    }

    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // Bring to front
        return prev.map(w => w.id === id
          ? { ...w, isMinimized: false, zIndex: ++zCounter }
          : w
        );
      }
      // New window
      return [...prev, { id, isMinimized: false, isMaximized: false, zIndex: ++zCounter }];
    });
  }, []);

  const minimizeApp = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  }, []);

  const maximizeApp = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const focusApp = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: ++zCounter } : w));
  }, []);

  // ── Styles (server-rendered profile) ──────────────────────────────────────
  const getWallpaperStyles = (): React.CSSProperties => {
    const wp = initialProfile?.wallpaper || "teal";

    // Handle custom uploaded base64 wallpapers (like GIFs or cropped JPEGs)
    if (wp.startsWith("data:image")) {
      return { backgroundColor: "#000" }; // The actual image will be rendered via an <img> tag
    }

    switch (wp) {
      case "bliss": return { backgroundImage: 'url("/wallpapers/bliss.png")', backgroundSize: "cover", backgroundPosition: "center" };
      case "vaporwave": return { backgroundImage: 'url("/wallpapers/vaporwave.png")', backgroundSize: "cover", backgroundPosition: "center" };
      case "cyberpunk": return { backgroundImage: 'url("/wallpapers/cyberpunk.png")', backgroundSize: "cover", backgroundPosition: "center" };
      case "office": return { backgroundImage: 'url("/wallpapers/Office Space Bliss.jpg")', backgroundSize: "cover", backgroundPosition: "center" };
      case "spongebob": return { backgroundImage: 'url("/wallpapers/spongebob.jpg.webp")', backgroundSize: "cover", backgroundPosition: "center" };
      case "night": return { backgroundColor: "#0f1024" };
      case "clouds": return { backgroundColor: "#3b82f6" };
      case "circuit": return { backgroundColor: "#1a1a1a" };
      default: return { backgroundColor: "#008080" }; // Default Teal
    }
  };

  const getThemeVars = () => {
    const theme = initialProfile?.theme || "classic";
    switch (theme) {
      case "midnight": return { "--win95-title-gradient": "linear-gradient(to right, #000033, #000066)" };
      case "forest": return { "--win95-title-gradient": "linear-gradient(to right, #004d00, #008000)" };
      case "matrix": return { "--win95-title-gradient": "linear-gradient(to right, #000000, #003300)" };
      default: return { "--win95-title-gradient": "linear-gradient(to right, #000080, #1084d0)" };
    }
  };

  // ── Context Menu ──────────────────────────────────────────────────────────
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: "desktop" });
  };
  const closeContextMenu = () => setContextMenu(null);

  const desktopContextMenuItems = [
    { label: "Refresh", onClick: () => window.location.reload() },
    { label: "SEPARATOR", onClick: () => { } },
    { label: "Personalize Dashboard", onClick: () => openApp("system") },
    { label: "About CampusOS", onClick: () => setIsEasterEggOpen(true) },
  ];

  const getContextMenuItems = () => {
    if (!contextMenu) return [];
    if (contextMenu.type === "icon") {
      return [
        { label: "Open", onClick: () => contextMenu.targetId && openApp(contextMenu.targetId) },
        { label: "SEPARATOR", onClick: () => { } },
        {
          label: "Delete", onClick: () => {
            if (contextMenu.targetId && !APP_REGISTRY[contextMenu.targetId].locked) {
              // SPECIAL: If it's the cat game, just uninstall/remove it completely, don't put in trash
              if (contextMenu.targetId === "catgame") {
                uninstallApp("catgame");
              } else {
                setTrashedIcons(prev => [...prev, contextMenu.targetId as string]);
                closeApp(contextMenu.targetId as string); 
              }
            }
          }, disabled: contextMenu.targetId ? APP_REGISTRY[contextMenu.targetId].locked : true
        }
      ];
    }
    if (contextMenu.type === "trash") {
      return [
        { label: "Open", onClick: () => openApp("trash") },
        { label: "SEPARATOR", onClick: () => { } },
        {
          label: "Empty Recycle Bin", onClick: async () => {
            setTrashedIcons([]);
            setTrashedPdfs([]);
            try {
              const { emptyTrashVaultItems } = await import("@/app/actions/vault");
              await emptyTrashVaultItems();
            } catch (e) { }
          }, disabled: trashedIcons.length === 0 && trashedPdfs.length === 0
        }
      ];
    }
    if (contextMenu.type === "trash-item") {
      return [
        {
          label: "Restore", onClick: () => {
            if (contextMenu.targetId) {
              setTrashedIcons(prev => prev.filter(id => id !== contextMenu.targetId));
            }
          }
        }
      ];
    }
    if (contextMenu.type === "trash-pdf") {
      return [
        {
          label: "Restore to Vault", onClick: async () => {
            if (contextMenu.targetId) {
              try {
                const { restoreVaultItem } = await import("@/app/actions/vault");
                await restoreVaultItem(contextMenu.targetId);
                setTrashedPdfs(prev => prev.filter(pdf => pdf.id !== contextMenu.targetId));
              } catch (e) { }
            }
          }
        }
      ];
    }
    return desktopContextMenuItems;
  };

  // ── Taskbar window list ────────────────────────────────────────────────────
  const topZ = Math.max(...windows.map(w => w.zIndex), 0);
  const taskbarWindows = windows.map(w => {
    let app = APP_REGISTRY[w.id];
    if (w.id === "trash") {
      app = { title: "Recycle Bin", iconUrl: trashedIcons.length > 0 ? "/icons/recycle_bin_full-2.png" : "/icons/recycle_bin_empty-0.png" } as any;
    }
    return {
      id: w.id,
      title: app.title,
      icon: app.iconUrl,
      isActive: !w.isMinimized && w.zIndex === topZ,
      isMinimized: w.isMinimized,
    };
  });

  return (
    <main
      className="relative h-screen w-screen overflow-hidden select-none scale-icons"
      style={{ ...getThemeVars(), ...getWallpaperStyles() } as any}
      onContextMenu={handleDesktopContextMenu}
      onClick={closeContextMenu}
    >
      {/* ── Custom Data Image Background (Preserves GIF Animation) ── */}
      {(initialProfile?.wallpaper || "").startsWith("data:image") && (
        <img
          src={initialProfile.wallpaper}
          alt="Custom Desktop Wallpaper"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Watermark */}
      <div className="watermark text-[#ffffff08]">
        CampusOS
        <div className="watermark-sub opacity-20 text-[10px] tracking-[15px] font-bold">YOUR STUDY DESKTOP</div>
      </div>

      {/* ── Desktop icon grid ── */}
      <div
        className="absolute inset-0 bottom-[34px] p-2 flex flex-col flex-wrap content-start items-start gap-y-1 gap-x-2 overflow-hidden"
      >
        {DESKTOP_ICONS.map(icon => {
          if (trashedIcons.includes(icon.id) || icon.id === "catgame") return null;
          return (
            <div key={icon.id} style={{ width: "75px" }}>
              <DesktopIcon
                label={icon.title}
                iconUrl={icon.iconUrl}
                locked={icon.locked}
                onDoubleClick={() => openApp(icon.id)}
                onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, type: "icon", targetId: icon.id })}
              />
            </div>
          );
        })}

        {/* ── Installed Applications ── */}
        {installedApps.map(appId => {
          const app = APP_REGISTRY[appId];
          if (!app || trashedIcons.includes(appId)) return null;
          return (
            <div key={appId} style={{ width: "75px" }}>
              <DesktopIcon
                label={app.title}
                iconUrl={app.iconUrl}
                onDoubleClick={() => openApp(appId)}
                onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, type: "icon", targetId: appId })}
              />
            </div>
          );
        })}

        <div style={{ width: "75px" }}>
          <DesktopIcon
            label="Recycle Bin"
            iconUrl={(trashedIcons.length > 0 || trashedPdfs.length > 0) ? "/icons/recycle_bin_full-2.png" : "/icons/recycle_bin_empty-0.png"}
            onDoubleClick={() => openApp("trash")}
            onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, type: "trash" })}
          />
        </div>
      </div>

      {/* ── Windows layer ── */}
      {windows.map(win => {
        if (win.id === "trash") {
          return (
            <div
              key={win.id}
              style={{
                display: win.isMinimized ? "none" : "block",
                position: "fixed", inset: 0, zIndex: win.zIndex, pointerEvents: "none",
              }}
            >
              <RetroWindow
                title="Recycle Bin"
                iconUrl={(trashedIcons.length > 0 || trashedPdfs.length > 0) ? "/icons/recycle_bin_full-2.png" : "/icons/recycle_bin_empty-0.png"}
                width="400px"
                height="300px"
                isMaximized={win.isMaximized}
                onClose={() => closeApp(win.id)}
                onMinimize={() => minimizeApp(win.id)}
                onMaximize={() => maximizeApp(win.id)}
                onFocus={() => focusApp(win.id)}
              >
                <div style={{ padding: "8px", display: "flex", flexWrap: "wrap", gap: "8px", alignContent: "flex-start", height: "100%", background: "#fff" }}>
                  {(trashedIcons.length === 0 && trashedPdfs.length === 0) ? (
                    <span style={{ fontSize: "11px", color: "#808080", fontFamily: "'MS Sans Serif', sans-serif" }}>Recycle Bin is empty.</span>
                  ) : (
                    <>
                      {trashedIcons.map(id => {
                        const app = APP_REGISTRY[id];
                        if (!app) return null;
                        return (
                          <div key={id} style={{ width: "75px" }}>
                            <DesktopIcon
                              label={app.title}
                              iconUrl={app.iconUrl}
                              onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, type: "trash-item", targetId: id })}
                            />
                          </div>
                        );
                      })}
                      {trashedPdfs.map(pdf => (
                        <div key={pdf.id} style={{ width: "75px" }}>
                          <DesktopIcon
                            label={`${pdf.title} (${pdf.subject})`}
                            iconUrl="/icons/help_book_big-0.png"
                            onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, type: "trash-pdf", targetId: pdf.id })}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </RetroWindow>
            </div>
          );
        }
        
        const app = APP_REGISTRY[win.id];
        if (!app || win.id === "catgame") return null;
        const AppComponent = app.component;

        return (
          <div
            key={win.id}
            style={{
              display: win.isMinimized ? "none" : "block",
              position: "fixed",
              inset: 0,
              zIndex: win.zIndex,
              pointerEvents: "none",
            }}
          >
            <RetroWindow
              title={app.title}
              iconUrl={app.iconUrl}
              width={app.width}
              height={app.height}
              isMaximized={win.isMaximized}
              onClose={() => closeApp(win.id)}
              onMinimize={() => minimizeApp(win.id)}
              onMaximize={() => maximizeApp(win.id)}
              onFocus={() => focusApp(win.id)}
            >
              <Suspense fallback={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px", fontFamily: "'MS Sans Serif', sans-serif", fontSize: "11px" }}>
                  <span>Loading...</span>
                </div>
              }>
                <AppComponent installApp={installApp} uninstallApp={uninstallApp} />
              </Suspense>
            </RetroWindow>
          </div>
        );
      })}

      {/* ── Individual Borderless Fullscreen Apps (Cat Game) ── */}
      {windows.find(w => w.id === "catgame") && (
        <Suspense fallback={null}>
          <CatGameApp onClose={() => closeApp("catgame")} />
        </Suspense>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {/* ── Easter Egg Modal ── */}
      {isEasterEggOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)"
        }}>
          <div style={{
            width: "400px", background: "#c0c0c0", border: "2px solid", borderColor: "#ffffff #808080 #808080 #ffffff",
            boxShadow: "inset 1px 1px 0px #dfdfdf, inset -1px -1px 0px #0a0a0a, 4px 4px 10px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column",
          }}>
            <div style={{ background: "linear-gradient(to right, #000080, #1084d0)", padding: "2px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: "bold", fontSize: "11px", fontFamily: "'MS Sans Serif', sans-serif" }}>About CampusOS</span>
              <button
                onClick={() => setIsEasterEggOpen(false)}
                style={{ width: "16px", height: "14px", background: "#c0c0c0", fontSize: "9px", lineHeight: 1, padding: 0, border: "2px solid", borderColor: "#dfdfdf #0a0a0a #0a0a0a #dfdfdf", cursor: "pointer", fontWeight: "bold" }}
              >✕</button>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'MS Sans Serif', sans-serif", fontSize: "11px", color: "#000", lineHeight: 1.5 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                <img
                  src="/images/me.jpg"
                  alt="CampusOS Developer"
                  style={{
                    maxHeight: "150px",
                    border: "2px solid",
                    borderColor: "#808080 #ffffff #ffffff #808080",
                    imageRendering: "auto"
                  }}
                />
              </div>

              <p style={{ margin: 0 }}>hiiii whoever you are,</p>
              <p style={{ margin: 0 }}>if your reading this congrats your one of the few who actually roams anywhere. but nvm that, this should be where i should say the about lmfao.</p>
              <p style={{ margin: 0 }}>so yeah made this website for students from a student myself, it still has ton of improvements but i think i can do it (if i sell my soul) im a solo developer, currently a 4th year IT student,</p>
              <p style={{ margin: 0 }}>
                if ur reading this click this link this is a secret{" "}
                <span
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    btn.textContent = "(claiming...)";
                    btn.style.pointerEvents = "none";
                    const { registerEarlyAdopter } = await import("@/app/actions/early_adopters");
                    const res = await registerEarlyAdopter();
                    if (res.error) {
                      btn.textContent = "(error)";
                      btn.style.color = "red";
                      setEasterEggMsg({ title: "Registry Error", text: res.error, type: "error" });
                    } else {
                      btn.textContent = "(Claimed!)";
                      btn.style.color = "green";
                      setEasterEggMsg({ title: "Achievement Unlocked", text: "🎉 " + res.message, type: "success" });
                    }
                  }}
                >
                  (link here)
                </span>{" "}
                and u will be exempt for the future premium shi im gonna do here coz honestly im broke af.
              </p>
              <p style={{ margin: 0 }}>so yeah hope u enjoy if u have problems just gonna put my email here "nicoconuty@gmail.com" anways thats all, i dont have any more to say. peace yo</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>-wana</p>


              <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <button
                  onClick={() => setIsEasterEggOpen(false)}
                  style={{ padding: "4px 24px", background: "#c0c0c0", border: "2px solid", borderColor: "#ffffff #808080 #808080 #ffffff", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseDown={(e) => { e.currentTarget.style.borderColor = "#808080 #ffffff #ffffff #808080"; }}
                  onMouseUp={(e) => { e.currentTarget.style.borderColor = "#ffffff #808080 #808080 #ffffff"; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Taskbar ── */}
      <Taskbar
        onOpenWindow={openApp}
        accountName={initialProfile?.username}
        streakCount={initialProfile?.streakCount}
        openWindows={taskbarWindows}
        onTaskClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (win?.isMinimized) {
            minimizeApp(id);
          } else {
            focusApp(id);
          }
        }}
      />

      <MessageBox
        isOpen={easterEggMsg !== null}
        title={easterEggMsg?.title || "System Message"}
        message={easterEggMsg?.text || ""}
        type={easterEggMsg?.type || "info"}
        onClose={() => setEasterEggMsg(null)}
      />
    </main>
  );
}
