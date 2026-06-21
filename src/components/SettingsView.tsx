import { useState } from "react";
import { 
  Check, 
  Linkedin, 
  Twitter, 
  Instagram, 
  BookOpen, 
  Mail, 
  Video, 
  Facebook,
  Download,
  UploadCloud,
  Settings,
  Sparkles,
  Heart,
  FileSpreadsheet
} from "lucide-react";
import { ChannelConfig, Post } from "../types";

interface SettingsViewProps {
  channels: ChannelConfig[];
  onToggleChannel: (id: string) => void;
  brandName: string;
  onUpdateBrandName: (name: string) => void;
  posts: Post[];
  onClearAllPosts: () => void;
  onLoadDemoPosts: () => void;
  onResetTheme: () => void;
}

export default function SettingsView({ 
  channels, 
  onToggleChannel, 
  brandName, 
  onUpdateBrandName,
  posts,
  onClearAllPosts,
  onLoadDemoPosts,
  onResetTheme
}: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"canaux" | "branding" | "export" | "integrations">("canaux");
  const [successExport, setSuccessExport] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Helper icons
  const getChannelIcon = (id: string, colorClass = "") => {
    switch (id) {
      case "linkedin": return <Linkedin className={`h-6 w-6 text-white`} />;
      case "twitter": return <Twitter className={`h-6 w-6 text-white`} />;
      case "instagram": return <Instagram className={`h-6 w-6 text-white`} />;
      case "blog": return <BookOpen className={`h-6 w-6 text-white`} />;
      case "newsletter": return <Mail className={`h-6 w-6 text-white`} />;
      case "tiktok": return <Video className={`h-6 w-6 text-white`} />;
      case "facebook": return <Facebook className={`h-6 w-6 text-white`} />;
      default: return null;
    }
  };

  // Real browser CSV export
  const handleExportCSV = () => {
    try {
      if (posts.length === 0) return;
      const headers = ["ID", "Titre", "Contenu", "Canal", "Statut", "Pilier", "Date", "Heure", "Campagne"];
      const rows = posts.map(p => [
        p.id, 
        `"${p.title.replace(/"/g, '""')}"`, 
        `"${p.content.replace(/"/g, '""')}"`, 
        p.channel, 
        p.status, 
        p.pillar, 
        p.date, 
        p.time || "09:00", 
        p.campaign || ""
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `gazette_planning_${brandName.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessExport(true);
      setTimeout(() => setSuccessExport(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Real browser JSON export
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `gazette_backup_${brandName.toLowerCase()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessExport(true);
    setTimeout(() => setSuccessExport(false), 3000);
  };

  return (
    <div id="settings-workspace" className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 md:p-10 font-sans text-[#131211]">
      
      {/* Title */}
      <header id="settings-header" className="flex items-center gap-3 mb-8">
        <div className="bg-[#131211] text-amber-500 p-2.5 rounded-lg">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif italic text-3xl font-light">Paramètres</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Personnalisez votre tableau de bord éditorial
          </p>
        </div>
      </header>

      {/* Internal Subtabs Row */}
      <section id="settings-tabs" className="mb-6 flex border-b border-gray-200">
        <button
          id="setsubtab-canaux"
          onClick={() => setActiveSubTab("canaux")}
          className={`pb-3 text-xs uppercase font-mono tracking-wider px-4 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === "canaux" 
              ? "border-amber-800 text-amber-950" 
              : "border-transparent text-gray-400 hover:text-gray-800"
          }`}
        >
          Canaux
        </button>
        <button
          id="setsubtab-branding"
          onClick={() => setActiveSubTab("branding")}
          className={`pb-3 text-xs uppercase font-mono tracking-wider px-4 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === "branding" 
              ? "border-amber-800 text-amber-950" 
              : "border-transparent text-gray-400 hover:text-gray-800"
          }`}
        >
          Branding
        </button>
        <button
          id="setsubtab-export"
          onClick={() => setActiveSubTab("export")}
          className={`pb-3 text-xs uppercase font-mono tracking-wider px-4 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === "export" 
              ? "border-amber-800 text-amber-950" 
              : "border-transparent text-gray-400 hover:text-gray-800"
          }`}
        >
          Export
        </button>
        <button
          id="setsubtab-integrations"
          onClick={() => setActiveSubTab("integrations")}
          className={`pb-3 text-xs uppercase font-mono tracking-wider px-4 transition-all border-b-2 font-bold cursor-pointer ${
            activeSubTab === "integrations" 
              ? "border-amber-800 text-amber-950" 
              : "border-transparent text-gray-400 hover:text-gray-800"
          }`}
        >
          Intégrations
        </button>
      </section>

      {/* Tab Panels content */}
      <div id="settings-panel-content">
        
        {/* Canaux / Channel Toggles Tab (Image 2) */}
        {activeSubTab === "canaux" && (
          <div id="settings-channel-grid-view">
            <p className="text-xs text-gray-500 mb-6 font-medium">
              Activez ou désactivez les canaux utilisés dans votre stratégie éditoriale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {channels.map((ch) => (
                <div
                  id={`channel-card-${ch.id}`}
                  key={ch.id}
                  onClick={() => onToggleChannel(ch.id)}
                  className={`border rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer ${
                    ch.active 
                      ? "border-amber-200/90 bg-white shadow-xs" 
                      : "border-gray-200 bg-gray-50/50 grayscale opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rounded badge matching style */}
                    <div 
                      className="p-2.5 rounded-xl shrink-0 text-white flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: ch.color }}
                    >
                      {getChannelIcon(ch.id)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{ch.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                        {ch.active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator circle right */}
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      ch.active ? "bg-emerald-500 shadow-xs" : "border border-gray-300 bg-transparent"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeSubTab === "branding" && (
          <div id="settings-branding-panel" className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs max-w-lg">
            <h3 className="font-serif italic text-lg font-bold mb-4">Identité Visuelle</h3>
            
            <form id="brand-update-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Nom d'auteur / Marque de publication
                </label>
                <input
                  id="brand-name-settings-input"
                  type="text"
                  value={brandName}
                  onChange={(e) => onUpdateBrandName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm py-2 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-[#131211]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Description courte (Slogan)
                </label>
                <textarea
                  id="brand-slogan-input"
                  rows={2}
                  defaultValue="La salle de rédaction, ordonnée comme un journal du matin."
                  className="bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-600 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                <div>
                  {savedFeedback && (
                    <span className="text-[11px] text-emerald-700 font-medium animate-pulse">
                      ✓ Changement enregistré !
                    </span>
                  )}
                </div>
                <button
                  id="save-branding-btn"
                  type="button"
                  onClick={() => {
                    setSavedFeedback(true);
                    setTimeout(() => setSavedFeedback(false), 2500);
                  }}
                  className="bg-[#131211] hover:bg-black text-[#FAF8F5] text-xs font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
                >
                  Sauvegarder
                </button>
              </div>
            </form>

            {/* Start at Zero / Demo Loader Options for New Users */}
            <div id="settings-danger-zone" className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-serif italic text-base font-bold text-gray-800 mb-2">
                Nouveau sur Gazette ?
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                En tant que créateur indépendant ou marque, vous préférez démarrer avec un planificateur à <strong>zéro publication</strong> pour y inscrire vos propres contenus.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
                <button
                  id="clear-all-data-action"
                  type="button"
                  onClick={() => {
                    if (confirm("Voulez-vous réinitialiser votre planning éditorial ? Vos publications existantes seront effacées pour démarrer à zéro (0 posts).")) {
                      onClearAllPosts();
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-950 font-bold py-2.5 px-3.5 rounded text-xs transition-colors flex items-center justify-center cursor-pointer text-center shrink-0"
                >
                  🗑️ Commencer à Zéro (0 publication)
                </button>
                <button
                  id="load-demo-data-action"
                  type="button"
                  onClick={() => {
                    if (confirm("Voulez-vous charger ou restaurer le planning de démonstration interactif Gazette ?")) {
                      onLoadDemoPosts();
                    }
                  }}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold py-2.5 px-3.5 rounded text-xs transition-colors flex items-center justify-center cursor-pointer text-center shrink-0"
                >
                  ✨ Recharger le planning démo
                </button>
                <button
                  id="reconfig-setup-theme-action"
                  type="button"
                  onClick={() => {
                    if (confirm("Voulez-vous réinitialiser votre Gazette et relancer l'assistant de configuration thématique ?")) {
                      onResetTheme();
                    }
                  }}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-300 font-bold py-2.5 px-3.5 rounded text-xs transition-colors flex items-center justify-center cursor-pointer text-center shrink-0"
                >
                  ⚙️ Relancer l'assistant de thème
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export / Backup Tab */}
        {activeSubTab === "export" && (
          <div id="settings-export-panel" className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs max-w-xl">
            <h3 className="font-serif italic text-lg font-bold mb-2">Sauvegarde & Exportations</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Téléchargez votre stratégie de communication à tout moment pour l'importer dans Excel ou sur d'autres plateformes d'analyse.
            </p>

            {successExport && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg mb-4 border border-emerald-100 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Document téléchargé automatiquement avec succès !</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CSV */}
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="border border-amber-200 hover:bg-amber-50/20 p-5 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
              >
                <FileSpreadsheet className="h-8 w-8 text-amber-800" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Télécharger au format CSV</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Idéal pour Microsoft Excel & Google Sheets</p>
                </div>
              </button>

              {/* JSON Backup */}
              <button
                id="export-json-btn"
                onClick={handleExportJSON}
                className="border border-gray-200 hover:bg-gray-50 p-5 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
              >
                <Download className="h-8 w-8 text-gray-500" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Télécharger la sauvegarde JSON</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Sauvegarde brute intégrale de tous vos posts</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Intégrations */}
        {activeSubTab === "integrations" && (
          <div id="settings-integrations-panel" className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs max-w-xl">
            <h3 className="font-serif italic text-lg font-bold mb-2">Intégrations directes</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Connectez Gazette à vos outils favoris pour publier automatiquement ou récupérer du contenu.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 bg-gray-50/40">
                <div className="flex items-center gap-3">
                  <span className="bg-[#0077B5] text-white p-1.5 rounded-md font-bold text-xs"><Linkedin className="h-4.5 w-4.5" /></span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">LinkedIn API autopublish</h5>
                    <p className="text-[10px] text-gray-400">Planifier et publier automatiquement sur vos profils</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded">Bientôt</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 bg-gray-50/40">
                <div className="flex items-center gap-3">
                  <span className="bg-[#0F1419] text-white p-1.5 rounded-md font-bold text-xs"><Twitter className="h-4.5 w-4.5" /></span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">X (Twitter) API integration</h5>
                    <p className="text-[10px] text-gray-400">Publiez vos Threads directement et suivez les stats</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded">Bientôt</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
