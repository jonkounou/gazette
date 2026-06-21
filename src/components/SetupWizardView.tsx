import React, { useState } from "react";
import { Sparkles, Loader2, BookOpen, MessageSquare, ArrowRight, Lightbulb } from "lucide-react";

interface SetupWizardViewProps {
  onComplete: (setupData: {
    brandName: string;
    brandSlogan: string;
    posts: any[];
    curationItems: any[];
    theme: string;
  }) => void;
}

const POPULAR_THEMES = [
  { id: "ia", label: "💡 Intelligence Artificielle & Productivité", value: "Applications concrètes de l'IA générative et du No-Code en entreprise" },
  { id: "immo", label: "🏢 Immobilier & Investissement", value: "Conseils en investissement locatif, achat de résidence et tendances du marché" },
  { id: "b2b", label: "📈 Marketing B2B & Growth", value: "Stratégie de contenu, génération de leads et copywriting pour indépendants" },
  { id: "hr", label: "🤝 Recrutement & RH", value: "Expérience collaborateur, marque employeur et futur du travail à distance" },
  { id: "dev", label: "💻 Code & Devops", value: "Tutoriels techniques, architecture logicielle et veille cybersécurité" }
];

export default function SetupWizardView({ onComplete }: SetupWizardViewProps) {
  const [theme, setTheme] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [wantsAiRefine, setWantsAiRefine] = useState(true);
  const [aiStyle, setAiStyle] = useState("Expert & Educatif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectPreset = (val: string) => {
    setTheme(val);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      setError("Veuillez saisir ou choisir un thème principal.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Call server to get matching theme, slogan and custom posts
      const themePayload = `${theme} ${customDescription ? `(Précisions : ${customDescription})` : ""}. Style souhaité : ${aiStyle}`;
      
      const themeRes = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup_theme",
          payload: { theme: themePayload }
        })
      });

      const themeData = await themeRes.json();
      if (themeData.error) {
        throw new Error(themeData.error);
      }

      // 2. Fetch curation items matching this theme for a fuller experience
      const curationRes = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "veille",
          payload: { topic: theme, amount: 5 }
        })
      });

      const curationData = await curationRes.json();

      // Format custom posts with real dates
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const todayString = `${year}-${month}-${day}`;

      const formattedPosts = (themeData.posts || []).map((p: any, idx: number) => {
        // Calculate offset days for calendar
        const offsetDate = new Date();
        offsetDate.setDate(currentDate.getDate() + (idx * 2) + 1);
        const oYear = offsetDate.getFullYear();
        const oMonth = String(offsetDate.getMonth() + 1).padStart(2, "0");
        const oDay = String(offsetDate.getDate()).padStart(2, "0");

        return {
          id: `post-gen-${Date.now()}-${idx}`,
          title: p.title || `Publication thématique #${idx + 1}`,
          content: p.content || "Contenu inspiré par votre thématique principale.",
          channel: p.channel || "linkedin",
          status: p.status || "idea",
          pillar: p.pillar || "Education",
          date: `${oYear}-${oMonth}-${oDay}`,
          time: "09:00",
          format: "Post simple",
          phase: p.phase || "Evergreen",
          tags: p.tags || ["ia", "tendance"],
          visuals: []
        };
      });

      // Format curation items
      const generatedCuration = (curationData.items || []).map((item: any, idx: number) => ({
        id: `curation-gen-${Date.now()}-${idx}`,
        title: item.title,
        summary: item.summary,
        source: item.source || "@intelligence_sharing",
        importance: item.importance || 0.85,
        tweetsCount: item.tweetsCount || 120,
        category: item.category || "USE-CASE",
        daysAgo: item.daysAgo || "il y a 1 jour"
      }));

      // Call completion with perfect data
      onComplete({
        brandName: themeData.brandName || "Mon Espace Gazette",
        brandSlogan: themeData.slogan || `Planification thématique sur ${theme}`,
        posts: formattedPosts,
        curationItems: generatedCuration,
        theme: theme
      });

    } catch (err: any) {
      console.error(err);
      setError("Désolé, impossible de se connecter à la génération intelligente. Vérifiez votre clé API ou réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="setup-wizard-overlay" className="fixed inset-0 bg-[#FAF8F5]/98 z-50 flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      <div id="setup-wizard-card" className="w-full max-w-2xl bg-[#FFFFFE] border border-[#E3DEC3]/40 rounded-2xl p-6 md:p-10 shadow-xl transition-all duration-300">
        <div id="setup-header" className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-full mb-3">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-serif italic text-3xl font-extrabold text-[#131211]">
            Bienvenue sur Gazette
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Configurons votre ligne éditoriale pour un voyage sur mesure. Tout votre système se met à jour automatiquement.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl border border-red-100 mb-6 flex items-start gap-2.5 leading-normal">
            <span>⚠️</span>
            <div>
              <span className="font-bold block">Impossible de paramétrer le thème</span>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div id="setup-loading" className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-10 w-10 text-amber-800 animate-spin" />
            <div>
              <h4 className="font-bold text-[#131211] text-sm font-serif italic">Génération de votre Gazette...</h4>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed">
                Gemini analyse votre thématique pour dresser un plan d'écriture complet, renommer votre média et créer les premières actualités de veille !
              </p>
            </div>
          </div>
        ) : (
          <form id="setup-theme-form" onSubmit={handleLaunch} className="space-y-6">
            
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                Sélectionnez une thématique populaire
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {POPULAR_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectPreset(t.value)}
                    className={`text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer flex flex-col gap-1 ${
                      theme === t.value 
                        ? "border-amber-500 bg-amber-50/30 text-amber-950 font-semibold" 
                        : "border-gray-100 hover:border-gray-200 text-gray-700 bg-gray-50/50"
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Theme Text Input */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex justify-between">
                <span>Ou définissez votre propre thème principal</span>
                <span className="text-[9px] text-amber-800 font-bold font-sans">★ Recommandé</span>
              </label>
              <textarea
                id="setup-theme-text"
                rows={2}
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Exemples : Stratégies de finances personnelles pour la génération Y, Astuces culinaires créatives et écologiques, ..."
                className="bg-gray-50 border border-gray-200 text-xs py-2.5 px-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-800 font-medium leading-relaxed"
              />
            </div>

            {/* Foldable details if they want to refine */}
            <div id="setup-fine-tuning" className="border-t border-gray-50 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWantsAiRefine(!wantsAiRefine)}
                  className="text-xs font-serif italic font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span>Affiner et personnaliser l'algorithme d'écriture {wantsAiRefine ? "▼" : "►"}</span>
                </button>
                <span className="text-[9px] text-gray-400 font-mono">Précisions facultatives</span>
              </div>

              {wantsAiRefine && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-mono uppercase text-gray-400 mb-1">
                      Ton d'écriture cible
                    </label>
                    <select
                      id="setup-style-dropdown"
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    >
                      <option value="Direct & Piquant">⚡ Court, Direct & Incisif</option>
                      <option value="Expert & Éducatif">📚 Pédagogique & Analytique</option>
                      <option value="Storyteller Inspirant">✨ Storytelling & Humain</option>
                      <option value="Technique & Scientifique">🔬 Précis, Technique & Neutre</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[9px] font-mono uppercase text-gray-400 mb-1">
                      Détails de votre persona / cible
                    </label>
                    <input
                      id="setup-description-input"
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Ex: dirigeants, jeunes alternants, gourmets..."
                      className="bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Launch Action */}
            <div id="setup-submit-wrapper" className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-[10px] text-gray-400 max-w-sm leading-normal">
                En lançant l'initialisation, Gazette videra vos simulations précédentes pour les remplacer entièrement par ce thème à jour.
              </p>
              
              <button
                id="do-setup-launch-btn"
                type="submit"
                className="bg-[#131211] hover:bg-black text-[#FAF8F5] transition-colors font-semibold py-2.5 px-5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Initialiser mon Espace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
