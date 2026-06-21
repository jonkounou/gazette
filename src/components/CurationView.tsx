import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  FileSpreadsheet,
  Send,
  Loader2,
  Trash2,
  ListFilter,
  Flame,
  Globe
} from "lucide-react";
import { CurationItem } from "../types";

interface CurationViewProps {
  curationItems: CurationItem[];
  onAddCurationItem: (item: CurationItem) => void;
  onSendToGazette: (item: CurationItem) => void;
  onDeleteCurationItem: (id: string) => void;
}

export default function CurationView({
  curationItems,
  onAddCurationItem,
  onSendToGazette,
  onDeleteCurationItem
}: CurationViewProps) {
  const [subTab, setSubTab] = useState<"stories" | "tweets" | "orphans">("stories");
  const [importanceThreshold, setImportanceThreshold] = useState<number>(0.50);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("Intelligence Artificielle");

  // Filter items by threshold
  const filteredCuration = curationItems.filter(item => {
    return item.importance >= importanceThreshold;
  });

  // Call Gemini proxy to harvest fresh news stories on any custom input topic!
  const handleHarvestNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicInput.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "veille",
          payload: {
            topic: newTopicInput,
            amount: 4
          }
        })
      });
      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, idx: number) => {
          onAddCurationItem({
            id: `cur-gen-${Date.now()}-${idx}`,
            title: item.title || "Actualité générée",
            summary: item.summary || "Aucun résumé disponible.",
            source: item.source || "@SyntheseIA",
            importance: item.importance || 0.75,
            tweetsCount: item.tweetsCount || 45,
            category: item.category || "USE-CASE",
            daysAgo: item.daysAgo || "À l'instant"
          });
        });
        setSelectedTopic(newTopicInput);
        setNewTopicInput("");
      } else if (data.error) {
        alert("Erreur de l'IA : " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur de communication est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "RELEASE": return "bg-pink-100 text-pink-700 hover:bg-pink-200";
      case "USE-CASE": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
      case "TUTORIAL": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "DEBATE": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getImportanceColor = (val: number) => {
    if (val >= 0.8) return "bg-rose-500";
    if (val >= 0.65) return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div id="curation-workspace" className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 md:p-10 font-sans">
      
      {/* Title block */}
      <header id="curation-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif italic text-3xl md:text-4xl text-[#131211] font-light">Veille X</h2>
          <p className="text-gray-500 text-xs mt-1.5 font-mono">
            {curationItems.length + 16500} tweets capturés • {curationItems.length} histoires qualifiées • Topic sélectionné: <span className="text-amber-800 font-bold">{selectedTopic}</span>
          </p>
        </div>

        {/* Top actions panel */}
        <div className="flex items-center gap-3">
          <form id="veille-generator-form" onSubmit={handleHarvestNews} className="flex gap-2">
            <div className="relative">
              <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-amber-500" />
              <input
                id="curation-topic-input"
                type="text"
                placeholder="Nouveau thème (ex: SEO, OpenAI)..."
                required
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                className="bg-white border border-gray-200/90 text-xs text-[#131211] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-lg pl-9 pr-3 py-2 w-56"
              />
            </div>
            <button
              id="request-harvester-btn"
              type="submit"
              disabled={isGenerating}
              className="bg-amber-800 hover:bg-amber-950 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-55"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Curation...</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5" />
                  <span>Analyser avec l'IA</span>
                </>
              )}
            </button>
          </form>
        </div>
      </header>

      {/* Curation view toggle & slider */}
      <section id="curation-controls-bar" className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Subtabs */}
          <div id="curation-subtabs" className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg w-fit">
            <button
              id="subtab-stories"
              onClick={() => setSubTab("stories")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-sans cursor-pointer transition-all ${
                subTab === "stories" 
                  ? "bg-white text-gray-900 shadow-xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              🔥 Histoires chaudes
            </button>
            <button
              id="subtab-tweets"
              onClick={() => setSubTab("tweets")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-sans cursor-pointer transition-all ${
                subTab === "tweets" 
                  ? "bg-white text-gray-900 shadow-xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              💬 Tweets bruts
            </button>
            <button
              id="subtab-orphans"
              onClick={() => setSubTab("orphans")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-sans cursor-pointer transition-all ${
                subTab === "orphans" 
                  ? "bg-white text-gray-900 shadow-xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              🔖 Orphelins
            </button>
          </div>

          {/* Importance Slider container */}
          <div id="slider-importance-filter" className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-mono font-bold shrink-0">Importance ≥</span>
            <input
              id="importance-range-slider"
              type="range"
              min="0.00"
              max="1.00"
              step="0.05"
              value={importanceThreshold}
              onChange={(e) => setImportanceThreshold(parseFloat(e.target.value))}
              className="accent-amber-800 cursor-pointer w-28 md:w-40"
            />
            <span className="text-xs font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shrink-0">
              {importanceThreshold.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Feed list/Grid */}
      <section id="curation-grid-feed">
        {subTab !== "stories" ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-xs">
            <p className="text-sm text-gray-400 font-medium">Flux de capture brut en cours de synchronisation...</p>
            <p className="text-xs text-gray-400 mt-2 font-mono">Consultez l'onglet « Histoires chaudes » extrait par l'IA Gazette.</p>
          </div>
        ) : filteredCuration.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-xs">
            <p className="text-sm text-gray-400 font-semibold">Aucune histoire qualifiée au dessus d'un score de {importanceThreshold.toFixed(2)}.</p>
            <p className="text-xs text-gray-400 mt-1">Réduisez le curseur d'importance ou lancez une analyse sur un nouveau thème !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCuration.map((story) => (
              <div
                id={`curation-card-${story.id}`}
                key={story.id}
                className="bg-white hover:shadow-md transition-all rounded-xl border border-gray-100 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card head: Tag + Importance Rating bar */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[9px] font-mono tracking-wider font-bold uppercase py-0.5 px-2 rounded-full leading-relaxed ${getCategoryColor(story.category)}`}>
                      {story.category}
                    </span>
                    
                    {/* Visual bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{
                            width: `${story.importance * 100}%`,
                            backgroundColor: story.importance >= 0.8 ? "#F43F5E" : "#F59E0B"
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-black text-gray-500">
                        {story.importance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Title & summary */}
                  <h3 className="text-base font-bold text-gray-800 leading-snug mb-2 font-sans hover:text-[#131211]">
                    {story.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 bg-white font-sans">
                    {story.summary}
                  </p>

                  {/* Simulated Source author card */}
                  <div id="simulated-tweet-box" className="bg-gray-50 rounded-lg p-2.5 mb-4 border border-gray-100 flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-[9px] text-slate-500 uppercase font-mono">
                      {story.source.replace("@", "").slice(0, 2)}
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono italic leading-normal">
                      <span className="font-bold text-gray-700 not-italic block">{story.source}</span>
                      « Analyse interne partagée par mail. Pistes logicielles prometteuses... »
                    </p>
                  </div>
                </div>

                {/* Footer buttons of the card */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1.5 shrink-0">
                  <div className="text-[10px] text-gray-400 font-mono">
                    <span className="font-semibold text-gray-600">{story.tweetsCount}</span> partages • {story.daysAgo}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-del-cur-${story.id}`}
                      onClick={() => onDeleteCurationItem(story.id)}
                      title="Masquer de l'actualité"
                      className="text-gray-400 hover:text-red-500 hover:bg-slate-50 p-1.5 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`btn-send-cur-${story.id}`}
                      onClick={() => onSendToGazette(story)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold py-1 px-2.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      Rédiger un post
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
