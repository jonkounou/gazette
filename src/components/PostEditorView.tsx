import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Sparkles, 
  Trash2, 
  Loader2, 
  Download, 
  Copy, 
  Share2, 
  Maximize2, 
  Check, 
  Calendar, 
  Clock, 
  FileText, 
  Layers, 
  FolderMinus, 
  Plus, 
  X,
  Linkedin,
  Instagram,
  Twitter,
  Flame,
  User as UserIcon,
  CheckCircle,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  Heart,
  Bookmark,
  Disc,
  Image as ImageIcon,
  BookOpen
} from "lucide-react";
import { Post, Campaign, ChannelConfig, EditorialPillar, PostStatus, User } from "../types";

interface PostEditorViewProps {
  editingPost: Post | null;
  postTitle: string;
  setPostTitle: (v: string) => void;
  postContent: string;
  setPostContent: (v: string) => void;
  postChannel: string;
  setPostChannel: (v: any) => void;
  postStatus: PostStatus;
  setPostStatus: (v: PostStatus) => void;
  postPillar: EditorialPillar;
  setPostPillar: (v: EditorialPillar) => void;
  postCampaign: string;
  setPostCampaign: (v: string) => void;
  postDate: string;
  setPostDate: (v: string) => void;
  postTime: string;
  setPostTime: (v: string) => void;
  campaigns: Campaign[];
  channels: ChannelConfig[];
  user: User | null;
  onSave: (e: React.FormEvent) => void;
  onDelete?: () => void;
  onCancel: () => void;
  handleExecuteAiWriting: (customTopic?: string, customTone?: string, customImprovement?: string) => Promise<string | null>;
  aiLoading: boolean;
  aiError: string;
  aiResult: string;
  setAiResult: (v: string) => void;
  aiTone: string;
  setAiTone: (v: string) => void;
  aiImprovement: string;
  setAiImprovement: (v: string) => void;
}

export default function PostEditorView({
  editingPost,
  postTitle,
  setPostTitle,
  postContent,
  setPostContent,
  postChannel,
  setPostChannel,
  postStatus,
  setPostStatus,
  postPillar,
  setPostPillar,
  postCampaign,
  setPostCampaign,
  postDate,
  setPostDate,
  postTime,
  setPostTime,
  campaigns,
  channels,
  user,
  onSave,
  onDelete,
  onCancel,
  handleExecuteAiWriting,
  aiLoading,
  aiError,
  aiResult,
  setAiResult,
  aiTone,
  setAiTone,
  aiImprovement,
  setAiImprovement
}: PostEditorViewProps) {
  
  // Tabs for live preview
  const [activePreviewTab, setActivePreviewTab] = useState<"linkedin" | "instagram" | "twitter" | "tiktok">("linkedin");
  
  // Synchronize dynamic preview tab with the saved channel (best effort initial state)
  useEffect(() => {
    if (["linkedin", "instagram", "twitter", "tiktok"].includes(postChannel)) {
      setActivePreviewTab(postChannel as any);
    }
  }, [postChannel]);

  // Handle format and phase from target mockup
  const [postFormat, setPostFormat] = useState(editingPost?.format || "Post simple");
  const [postPhase, setPostPhase] = useState(editingPost?.phase || "Evergreen");
  
  // Custom tag manager state
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(() => {
    return editingPost?.tags || ["veille-claude", "claude", "ia", "développement"];
  });

  // Attached visuals
  const [visuals, setVisuals] = useState<string[]>(() => {
    return editingPost?.visuals || [];
  });
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [visualPrompt, setVisualPrompt] = useState("");

  const formats = ["Thread", "Post simple", "Article de fond", "Vidéo courte", "Interview", "Script", "Brouillon"];
  const phases = ["Evergreen", "Lancement", "Tendance", "Offre Spéciale"];

  // Clipboard copy helper
  const [copiedText, setCopiedText] = useState(false);
  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(postContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Add tag handler
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/#/g, "");
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Gemini rewrite/generation trigger wrapper
  const handleTriggerAiWriter = async () => {
    await handleExecuteAiWriting(postTitle, aiTone, aiImprovement);
  };

  // Quick optimization button "Adapter"
  const [isAdapting, setIsAdapting] = useState(false);
  const handleAdaptChannelWithAi = async () => {
    setIsAdapting(true);
    try {
      const channelLabel = activePreviewTab === "linkedin" ? "LinkedIn (aéré, professionnel)" : 
                           activePreviewTab === "instagram" ? "Instagram (visuel, accrocheur, hashtags)" :
                           activePreviewTab === "twitter" ? "X / Twitter (court, incisif, max 280 car)" : "TikTok (accroche narrative courte)";
      
      const payload = {
        action: "refine",
        payload: {
          text: postContent || `Écris un post complet sur le sujet: "${postTitle}"`,
          channel: activePreviewTab,
          improvement: `Adapte ce texte au réseau ${channelLabel}. Optimise l'espacement, le ton de voix, et insère les hashtags d'experts adéquats.`
        }
      };

      const res = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.result) {
        setPostContent(data.result);
        setPostChannel(activePreviewTab);
      } else if (data.error) {
        alert("Erreur de l'IA : " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Impossible d'adapter la publication.");
    } finally {
      setIsAdapting(false);
    }
  };

  // Instant Title Optimizer using AI
  const [isOptimizingTitle, setIsOptimizingTitle] = useState(false);
  const handleOptimizeTitleWithAi = async () => {
    if (!postTitle.trim()) {
      alert("Veuillez saisir un premier jet de titre ou sujet d'abord.");
      return;
    }
    setIsOptimizingTitle(true);
    try {
      const payload = {
        action: "refine",
        payload: {
          text: postTitle,
          channel: postChannel,
          improvement: "Transforme ceci en un titre de publication social media ultra percutant, captivant et professionnel, en français. Propose uniquement LA meilleure version sans fioritures ni guillemets."
        }
      };
      const res = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.result) {
        setPostTitle(data.result.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizingTitle(false);
    }
  };

  // Simulated Visual Generator matching Gemini / image-generation skill
  const handleGenerateVisualWithAi = async () => {
    setIsGeneratingVisual(true);
    try {
      // Create a nice abstract or themed svg style thumbnail based on the title keywords
      // Or simply assign a gorgeous curated gradient URL that matches thematic tags
      const themes = [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80", // AI Abstract
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", // Graphic Orange
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80", // 3D Shapes
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80", // Blockchain/Net
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80"  // Deep Warm gradient
      ];
      
      const randomImage = themes[Math.floor(Math.random() * themes.length)];
      
      // Artificial delay to simulate real AI model inference
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVisuals(prev => [...prev, randomImage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Custom visual list removal
  const handleRemoveVisual = (index: number) => {
    setVisuals(prev => prev.filter((_, idx) => idx !== index));
  };

  // Inject metadata into save form and run parent trigger
  const handlePreSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build simulated submit event to pass down values neatly or trigger parents save action directly
    // Let's create an elegant wrapper that writes states directly then invokes parent save
    if (editingPost) {
      editingPost.format = postFormat;
      editingPost.phase = postPhase;
      editingPost.tags = tags;
      editingPost.visuals = visuals;
    } else {
      // In create mode we will mutate states in App.tsx or we can let App.tsx do its standard saving
      // However to have these fields persisted, we'll assign the custom fields to global state in save handler
    }
    onSave(e); 
  };

  // Format date helper for french standard
  const displayDateStr = () => {
    if (!postDate) return "Jour non défini";
    try {
      const d = new Date(postDate);
      return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + ` — ${postTime}`;
    } catch (e) {
      return postDate;
    }
  };

  return (
    <div id="extended-post-editor" className="flex-1 flex flex-col h-screen bg-[#FDFBF7] text-[#131211] font-sans overflow-hidden">
      
      {/* Top sticky action banner */}
      <header id="editor-action-header" className="px-6 py-4 border-b border-[#E3DEC3]/40 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            id="editor-back-btn"
            onClick={onCancel}
            title="Retour au calendrier"
            className="p-1.5 hover:bg-[#FAF8F5] rounded border border-[#E3DEC3]/35 text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-gray-400 font-mono tracking-wider max-w-sm truncate hidden md:block">
              {editingPost ? "ÉDITION PUBLICATION" : "NOUVELLE PLANIFICATION"}
            </h1>
            <span className="text-gray-300 hidden md:block">|</span>
            
            {/* Elegant Status Dropdown styled as a Pill */}
            <div className="relative inline-block">
              <select
                id="header-post-status"
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value as PostStatus)}
                className={`text-xs font-bold py-1 px-3.5 pr-8 rounded-full border border-gray-200 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 text-center uppercase tracking-wider ${
                  postStatus === "idea" ? "bg-amber-50 text-amber-800 border-amber-200" :
                  postStatus === "draft" ? "bg-blue-50 text-blue-800 border-blue-200" :
                  postStatus === "review" ? "bg-purple-50 text-purple-800 border-purple-200" :
                  postStatus === "scheduled" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                  "bg-slate-100 text-slate-800 border-slate-300"
                }`}
              >
                <option value="idea">Idée</option>
                <option value="draft">Brouillon</option>
                <option value="review">En review</option>
                <option value="scheduled">Planifié</option>
                <option value="published">Publié</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* Action button grouping */}
        <div className="flex items-center gap-2">
          
          {/* AI Drafting Prompt button */}
          <button
            id="editor-ai-draft-btn"
            type="button"
            onClick={handleTriggerAiWriter}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8D7FCD]/10 text-[#6B5BAE] border border-[#8D7FCD]/20 rounded font-semibold text-xs hover:bg-[#8D7FCD]/15 transition-all cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[#8D7FCD]" />
            )}
            <span>Rédiger avec IA</span>
          </button>

          <button
            id="editor-review-btn"
            type="button"
            onClick={() => {
              setPostStatus("review");
              alert("Le statut a été mis à jour sur 'En review'. Appuyez sur Enregistrer pour confirmer.");
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-[#131211] border border-[#E3DEC3]/60 rounded font-semibold text-xs transition-colors cursor-pointer"
          >
            Review
          </button>

          <button
            id="editor-save-btn"
            onClick={handlePreSaveSubmit}
            className="px-4 py-1.5 bg-[#131211] hover:bg-black text-[#FAF8F5] rounded font-semibold text-xs tracking-wide transition-colors cursor-pointer shadow-xs"
          >
            {editingPost ? "Planifier" : "Planifier"}
          </button>

          {editingPost && onDelete && (
            <button
              id="editor-delete-btn"
              type="button"
              onClick={onDelete}
              title="Supprimer la publication"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded transition-colors cursor-pointer ml-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main split viewport layout */}
      <div id="editor-split-panes" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left pane: Modular Editorial Form */}
        <div id="editor-left-form-pane" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 lg:border-r lg:border-[#E3DEC3]/30">
          
          <form id="editor-left-form" onSubmit={handlePreSaveSubmit} className="space-y-6">
            
            {/* Title field block */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600 font-sans">
                  Titre <span className="text-red-500 font-serif">*</span>
                </label>
                <button
                  id="optimise-title-btn"
                  type="button"
                  onClick={handleOptimizeTitleWithAi}
                  disabled={isOptimizingTitle}
                  className="text-[10px] text-[#DD7E5C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isOptimizingTitle ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-2.5 w-2.5" />
                  )}
                  <span>Optimiser Titre IA</span>
                </button>
              </div>
              <input
                id="editor-post-title"
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="ex: Mise à jour Claude Code : plus de stabilité"
                className="w-full bg-white text-[#131211] text-sm py-2.5 px-3.5 rounded-lg border border-[#E3DEC3]/50 focus:outline-none focus:ring-1 focus:ring-[#DD7E5C] font-semibold"
              />
            </div>

            {/* Content field block */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600 font-sans">
                  Contenu
                </label>
                
                {/* Tone configurations dropdown for writer */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">Ton:</span>
                  <select
                    id="editor-ai-tone-inline"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="bg-[#FAF8F5] border border-gray-200 text-xs py-0.5 px-2 rounded focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="Professionnel">👔 Pro</option>
                    <option value="Incisif">⚡ Court</option>
                    <option value="Inspirant">✨ Inspirant</option>
                    <option value="Technique">💻 Tech</option>
                  </select>
                </div>
              </div>
              <textarea
                id="editor-post-content"
                rows={10}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Écrivez le corps de votre publication... (ajoutez des paragraphes nets et des puces d'impact)"
                className="w-full bg-white text-[#131211] text-xs py-3 px-3.5 rounded-lg border border-[#E3DEC3]/50 focus:outline-none focus:ring-1 focus:ring-[#DD7E5C] leading-relaxed font-sans font-medium"
              />
            </div>

            {/* Visual separator for METADATA */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[#E3DEC3]/30"></div>
              <span className="mx-4 text-[9px] font-mono tracking-[0.25em] text-gray-400 font-extrabold uppercase bg-[#FDFBF7] px-2">
                MÉTADONNÉES
              </span>
              <div className="flex-1 border-t border-[#E3DEC3]/30"></div>
            </div>

            {/* Metadata Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Format selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                  Format
                </label>
                <select
                  id="editor-post-format"
                  value={postFormat}
                  onChange={(e) => setPostFormat(e.target.value)}
                  className="bg-white text-[#131211] text-xs py-2.5 px-3 rounded-lg border border-[#E3DEC3]/40 focus:outline-none focus:ring-1 focus:ring-[#DD7E5C] font-semibold cursor-pointer"
                >
                  {formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Phase selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                  Phase
                </label>
                <select
                  id="editor-post-phase"
                  value={postPhase}
                  onChange={(e) => setPostPhase(e.target.value)}
                  className="bg-white text-[#131211] text-xs py-2.5 px-3 rounded-lg border border-[#E3DEC3]/40 focus:outline-none focus:ring-1 focus:ring-[#DD7E5C] font-semibold cursor-pointer"
                >
                  {phases.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Diffusion Date and hour picker */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                    Date
                  </label>
                  <input
                    id="editor-post-date"
                    type="date"
                    required
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="w-full bg-white text-[#131211] text-xs py-2 px-2.5 rounded-lg border border-[#E3DEC3]/40 focus:outline-none font-bold cursor-pointer"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                    Heure
                  </label>
                  <input
                    id="editor-post-time"
                    type="time"
                    required
                    value={postTime}
                    onChange={(e) => setPostTime(e.target.value)}
                    className="w-full bg-white text-[#131211] text-xs py-2 px-2 rounded-lg border border-[#E3DEC3]/40 focus:outline-none font-bold cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Curation tags line */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                Tags associés
              </label>
              <div className="bg-white border border-[#E3DEC3]/45 rounded-lg p-2 flex flex-wrap gap-1.5 items-center">
                {tags.map(t => (
                  <span 
                    key={t} 
                    className="bg-[#FAF8F5] text-gray-700 hover:text-black hover:bg-red-50 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-[#E3DEC3]/30 flex items-center gap-1 transition-all"
                  >
                    <span>#{t}</span>
                    <button 
                      id={`remove-tag-btn-${t}`}
                      type="button" 
                      onClick={() => handleRemoveTag(t)}
                      className="text-gray-400 hover:text-red-500 font-black cursor-pointer text-[9px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="editor-tag-input"
                  type="text"
                  placeholder="Ajouter... (Entrée / Virgule)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none min-w-[120px] flex-1 font-mono"
                />
              </div>
            </div>

            {/* Visuels Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-black">
                  Visuels
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    id="gen-visual-ai-btn"
                    type="button"
                    onClick={handleGenerateVisualWithAi}
                    disabled={isGeneratingVisual}
                    className="bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-[10px] font-bold py-1 px-2.5 rounded transition-colors flex items-center gap-1 cursor-pointer border border-amber-200"
                  >
                    {isGeneratingVisual ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Générer IA
                  </button>
                  
                  <button
                    id="canva-embed"
                    type="button"
                    onClick={() => alert("Simulation d'exportation de maquette de design Canva à Gazette...")}
                    className="bg-purple-50 hover:bg-purple-100 text-[#7c2ebd] text-[10px] font-bold py-1 px-2.5 rounded transition-colors flex items-center gap-1 cursor-pointer border border-[#c6aaec]"
                  >
                    <span className="font-sans font-black bg-[#7c2ebd] text-white w-3 h-3 rounded-xs text-[7px] flex items-center justify-center uppercase leading-none">C</span>
                    Canva
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone / Thumbnails grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {visuals.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-[#E3DEC3]/40 aspect-video bg-gray-50 flex items-center justify-center">
                    <img 
                      src={src} 
                      alt="Publication Visual" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      id={`remove-visual-img-${i}`}
                      type="button"
                      onClick={() => handleRemoveVisual(i)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {/* Drag zone item placeholder */}
                <div 
                  id="drop-zone-trigger"
                  onClick={handleGenerateVisualWithAi}
                  className="rounded-lg border border-dashed border-[#E3DEC3]/60 hover:border-[#DD7E5C] transition-colors aspect-video flex flex-col items-center justify-center text-center p-3 cursor-pointer bg-[#FAF8F5]/40"
                >
                  <p className="text-[10px] text-gray-500 font-semibold">Glisser-déposer vos images ici...</p>
                  <p className="text-[8px] text-gray-400 font-mono mt-1">Format recommandé 16:9 ou 1:1</p>
                </div>
              </div>
            </div>

            {/* Error messaging inside form wrapper if query failed */}
            {aiError && (
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 leading-normal font-medium">
                {aiError}
              </div>
            )}

          </form>

        </div>

        {/* Right pane: Dedicated Multi-Platform Live Preview Screen */}
        <div id="editor-right-preview-pane" className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF8F5]/65 flex flex-col min-h-full">
          
          {/* Header toolbar mimicking mockup */}
          <section id="preview-tab-controls" className="border-b border-[#E3DEC3]/25 pb-3 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-white border border-[#E3DEC3]/40 rounded-lg p-0.5 shadow-2xs gap-0.5 shrink-0">
              <button
                id="preview-tab-linkedin"
                onClick={() => setActivePreviewTab("linkedin")}
                className={`px-3 py-1 bg-transparent hover:bg-gray-50 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                  activePreviewTab === "linkedin" 
                    ? "bg-[#FEF2E8] text-[#DD7E5C] border border-[#F3DEC3]" 
                    : "text-gray-500"
                }`}
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </button>

              <button
                id="preview-tab-instagram"
                onClick={() => setActivePreviewTab("instagram")}
                className={`px-3 py-1 bg-transparent hover:bg-gray-50 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                  activePreviewTab === "instagram" 
                    ? "bg-[#FEF2E8] text-[#DD7E5C] border border-[#F3DEC3]" 
                    : "text-gray-500"
                }`}
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram</span>
              </button>

              <button
                id="preview-tab-twitter"
                onClick={() => setActivePreviewTab("twitter")}
                className={`px-3 py-1 bg-transparent hover:bg-gray-50 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                  activePreviewTab === "twitter" 
                    ? "bg-[#FEF2E8] text-[#DD7E5C] border border-[#F3DEC3]" 
                    : "text-gray-500"
                }`}
              >
                <Twitter className="h-3.5 w-3.5" />
                <span>X / Twitter</span>
              </button>

              <button
                id="preview-tab-tiktok"
                onClick={() => setActivePreviewTab("tiktok")}
                className={`px-3 py-1 bg-transparent hover:bg-gray-50 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                  activePreviewTab === "tiktok" 
                    ? "bg-[#FEF2E8] text-[#DD7E5C] border border-[#F3DEC3]" 
                    : "text-gray-500"
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-red-500" />
                <span>TikTok</span>
              </button>
            </div>

            {/* Tab control action buttons */}
            <div className="flex items-center gap-1.5">
              
              <button
                id="ai-adapter-channel-btn"
                type="button"
                onClick={handleAdaptChannelWithAi}
                disabled={isAdapting}
                className="bg-[#8D7FCD]/8 bg-white border border-[#E3DEC3]/40 text-[#6B5BAE] text-[10px] font-bold py-1 px-2.5 rounded hover:bg-[#8D7FCD]/15 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isAdapting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 text-[#8D7FCD]" />
                )}
                <span>Adapter</span>
              </button>

              <div className="border-r border-[#E3DEC3]/40 h-4 mx-1"></div>

              <button 
                id="preview-ic-font-btn"
                onClick={() => alert("Changer de typographie / format brut de police")}
                className="p-1 text-gray-400 hover:text-black hover:bg-white rounded transition-colors cursor-pointer" 
                title="Style de texte"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>

              <button 
                id="preview-ic-copy"
                onClick={handleCopyClipboard}
                className={`p-1 rounded transition-all cursor-pointer ${copiedText ? "text-emerald-500 bg-emerald-50" : "text-gray-400 hover:text-black hover:bg-white"}`} 
                title="Copier le texte"
              >
                {copiedText ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button 
                id="preview-ic-share"
                onClick={() => alert("Simulation de lien public d'approbation partagé pour validation")}
                className="p-1 text-gray-400 hover:text-black hover:bg-white rounded transition-colors cursor-pointer" 
                title="Lien d'approbation"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>

              <button 
                id="preview-ic-fullscr"
                onClick={() => alert("Visualisation en plein écran du post...")}
                className="p-1 text-gray-400 hover:text-black hover:bg-white rounded transition-colors cursor-pointer" 
                title="Plein écran"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* Social Platform Mock Card Canvas container */}
          <div id="mock-preview-viewport" className="flex-1 flex flex-col justify-start items-center">
            
            {activePreviewTab === "linkedin" && (
              <div id="linkedin-mockup-card" className="w-full max-w-md bg-white border border-gray-200/90 rounded-lg shadow-2xs font-sans overflow-hidden py-3">
                
                {/* User card profile */}
                <div className="flex items-center px-4 gap-2 border-b border-gray-50 pb-2.5">
                  <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 bg-[#DD7E5C] text-white text-xs font-bold leading-none select-none font-sans uppercase">
                    {user?.name ? user.name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "GA"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate leading-none hover:text-blue-700 hover:underline cursor-pointer">{user?.name || "AprenX"}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">• 1er</span>
                    </div>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 truncate leading-tight">{user?.role || "Formation IA | Claude | Afrique"}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5">
                      <span>il y a maintenant</span>
                      <span>•</span>
                      <span>🌐</span>
                    </div>
                  </div>
                  
                  <button className="ml-auto text-gray-400 hover:text-black p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Body message content flow */}
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line select-text font-serif italic text-[13px]">
                    {postContent || "Commencez à rédiger votre texte dans le volet de gauche ou cliquez sur 'Rédiger avec IA' pour générer du contenu automatisé."}
                  </p>
                  
                  {/* Output Tags as Hashtags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 text-[11px] font-bold text-blue-700 select-text">
                      {tags.map(t => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attached Main banner Image if loaded */}
                <div className="relative mt-2">
                  {visuals.length > 0 ? (
                    <img 
                      src={visuals[0]} 
                      alt="Publication main display" 
                      className="w-full object-cover max-h-64 border-y border-gray-100" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-50 border-y border-gray-100/90 flex flex-col items-center justify-center text-gray-400 p-4">
                      <ImageIcon className="h-8 w-8 text-gray-300 mb-1" />
                      <span className="text-[10px] font-serif italic font-semibold text-gray-400">Image 1200 × 627</span>
                    </div>
                  )}
                </div>

                {/* Simulating organic interaction stats */}
                <footer className="mt-3.5">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-gray-100/80 text-[10px] text-gray-400 font-sans">
                    <div className="flex items-center gap-1 bg-white">
                      <span className="flex items-center justify-center bg-blue-500 rounded-full w-4.5 h-4.5 text-white text-[8px]">👍</span>
                      <span className="flex items-center justify-center bg-rose-500 rounded-full w-4.5 h-4.5 text-white text-[8px] -ml-1.5">❤️</span>
                      <span className="font-semibold text-gray-600 block pl-1">219</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="hover:text-blue-700 hover:underline cursor-pointer">29 commentaires</span>
                      <span>•</span>
                      <span className="hover:text-blue-700 hover:underline cursor-pointer">24 partages</span>
                    </div>
                  </div>

                  {/* Immediate buttons */}
                  <div className="grid grid-cols-4 pt-1.5 px-2 text-[11px] text-gray-500 font-bold text-center">
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-slate-50 transition-colors rounded cursor-pointer">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>J'aime</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-slate-50 transition-colors rounded cursor-pointer">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Commenter</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-slate-50 transition-colors rounded cursor-pointer">
                      <Repeat className="h-3.5 w-3.5" />
                      <span>Partager</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-slate-50 transition-colors rounded cursor-pointer">
                      <Send className="h-3.5 w-3.5" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </footer>

              </div>
            )}

            {activePreviewTab === "instagram" && (
              <div id="instagram-mockup-card" className="w-full max-w-sm bg-white border border-gray-200/90 rounded-lg shadow-2xs font-sans overflow-hidden">
                
                {/* Profile row */}
                <div className="flex items-center px-3 py-3 gap-2">
                  <div className="w-8 h-8 rounded-full ring-2 ring-pink-500 ring-offset-1 overflow-hidden shrink-0 bg-[#DD7E5C] text-white text-[10px] font-bold flex items-center justify-center select-none uppercase">
                    {user?.name ? user.name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "GA"}
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-gray-900 leading-none">{user?.name?.toLowerCase().replace(/\s/g, "_") || "aprenx"}</h4>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Sponsorisé • Paris, France</span>
                  </div>
                  
                  <MoreHorizontal className="h-4 w-4 text-gray-500 ml-auto mr-1" />
                </div>

                {/* Image block (mandatory beautiful square aspect) */}
                <div className="w-full aspect-square bg-[#FAF8F5] border-y border-gray-100 flex items-center justify-center relative overflow-hidden">
                  {visuals.length > 0 ? (
                    <img 
                      src={visuals[0]} 
                      alt="Instagram Display Visual" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-gray-400 p-6">
                      <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                      <span className="font-serif italic text-sm font-semibold">Image 1080 × 1080 (Square)</span>
                    </div>
                  )}
                </div>

                {/* Footer and reactions bar */}
                <div className="p-3">
                  <div className="flex items-center gap-3.5">
                    <Heart className="h-5 w-5 text-gray-700 hover:text-rose-600 transition-colors cursor-pointer" />
                    <MessageSquare className="h-5 w-5 text-gray-700 hover:text-blue-500 transition-colors cursor-pointer" />
                    <Send className="h-5 w-5 text-gray-700 hover:-rotate-45 transition-transform cursor-pointer" />
                    <Bookmark className="h-5 w-5 text-gray-700 ml-auto hover:text-amber-500 transition-colors cursor-pointer" />
                  </div>

                  <p className="text-[11px] font-bold mt-2 text-gray-800">
                    Aimé par <span className="underline">jean_dupont</span> et <span className="font-black">1 248 autres personnes</span>
                  </p>

                  <div className="mt-1.5 leading-relaxed text-slate-800 text-[11.5px] select-text">
                    <span className="font-bold text-gray-900 mr-1.5">{user?.name?.toLowerCase().replace(/\s/g, "_") || "aprenx"}</span>
                    {postContent || "Écrivez le corps de votre message..."}
                  </div>

                  {/* Instagran HashTags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[11px] text-sky-800 mt-2 font-bold select-text">
                      {tags.map(t => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-gray-400 uppercase font-mono tracking-widest block mt-3">IL Y A 2 HEURES</span>
                </div>

              </div>
            )}

            {activePreviewTab === "twitter" && (
              <div id="twitter-mockup-card" className="w-full max-w-md bg-white border border-gray-200/95 rounded-lg shadow-2xs p-4 font-sans select-text">
                
                {/* Account card */}
                <div className="flex justify-between items-start gap-2.5">
                  <div className="flex gap-2.5">
                    <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center bg-[#DD7E5C] text-white text-xs font-bold leading-none select-none font-sans uppercase shrink-0">
                      {user?.name ? user.name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "GA"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-gray-900 leading-none">{user?.name || "AprenX"}</h4>
                        <span className="w-3.5 h-3.5 bg-[#DD7E5C] text-white rounded-full flex items-center justify-center text-[8px] font-mono select-none" title="Compte Certifié">✓</span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-0.5 font-mono leading-none">@{user?.name?.toLowerCase().replace(/\s/g, "") || "aprenx"}</span>
                    </div>
                  </div>
                  
                  <button className="bg-black hover:bg-neutral-800 text-white font-semibold text-[10px] px-3 py-1 rounded-full cursor-pointer">
                    Suivre
                  </button>
                </div>

                {/* Truncated / Spaced message according to X rules */}
                <div className="my-3 text-xs leading-relaxed text-neutral-800 select-text font-serif italic text-[13.5px]">
                  {postContent ? (
                    postContent.length > 280 ? (
                      <div>
                        {postContent.slice(0, 277)}...
                        <span className="font-bold text-blue-500 block">Afficher la suite (Thread)</span>
                      </div>
                    ) : postContent
                  ) : "Saisissez du contenu..."}
                </div>

                {/* Output X tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-blue-500 mb-3 select-text">
                    {tags.map(t => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                )}

                {/* X Attached Media image */}
                {visuals.length > 0 ? (
                  <img 
                    src={visuals[0]} 
                    alt="X Tweet Banner" 
                    className="w-full max-h-56 object-cover rounded-xl border border-gray-100 mb-3.5" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-50 rounded-xl border border-gray-200/90 flex flex-col items-center justify-center text-gray-400 p-2 mb-3.5">
                    <ImageIcon className="h-6 w-6 text-gray-300 mb-1" />
                    <span className="font-serif text-[9px] tracking-wide text-gray-400">Vue média X (16:9)</span>
                  </div>
                )}

                <div className="flex items-center text-[10px] text-gray-400 font-mono border-b border-gray-100 pb-2.5">
                  <span>14:50 • 21 juin 2026 • </span>
                  <span className="font-bold text-neutral-800 pl-1">Gazette Pro</span>
                </div>

                {/* Simulated counts */}
                <div className="flex items-center gap-4 text-[10px] text-gray-400 border-b border-gray-100 py-2.5 font-mono">
                  <span><strong>11.4k</strong> Vues</span>
                  <span><strong>145</strong> Retweets</span>
                  <span><strong>2,410</strong> Likes</span>
                </div>

                {/* Social thread buttons bar */}
                <div className="flex items-center justify-between text-gray-400 px-1 pt-2">
                  <button className="hover:text-sky-500 flex items-center gap-1 cursor-pointer"><MessageSquare className="h-4 w-4" /><span className="text-[9px] font-mono">34</span></button>
                  <button className="hover:text-emerald-500 flex items-center gap-1 cursor-pointer"><Repeat className="h-4 w-4" /><span className="text-[9px] font-mono">145</span></button>
                  <button className="hover:text-pink-500 flex items-center gap-1 cursor-pointer"><Heart className="h-4 w-4" /><span className="text-[9px] font-mono">2,410</span></button>
                  <button className="hover:text-amber-500 flex items-center gap-1 cursor-pointer"><Bookmark className="h-4 w-4" /></button>
                  <button className="hover:text-blue-500 flex items-center cursor-pointer"><Send className="h-4 w-4" /></button>
                </div>

              </div>
            )}

            {activePreviewTab === "tiktok" && (
              <div id="tiktok-mockup-card" className="w-full max-w-[280px] aspect-[9/16] bg-neutral-950 rounded-3xl overflow-hidden shadow-xl text-white relative font-sans">
                
                {/* Simulated vertical backdrop image based on attached visuals or standard editorial dark placeholder */}
                <div className="absolute inset-0 z-0 bg-neutral-900 select-none">
                  {visuals.length > 0 ? (
                    <img 
                      src={visuals[0]} 
                      alt="TikTok backdrop preview" 
                      className="w-full h-full object-cover opacity-60 filter blur-xs" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#1E112A] via-[#0E0D0E] to-neutral-950 flex flex-col items-center justify-center text-neutral-700">
                      <ImageIcon className="h-12 w-12 opacity-30 mb-2" />
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-40">Arrière-plan 9:16</span>
                    </div>
                  )}
                </div>

                {/* Top content bar */}
                <div className="absolute top-4 inset-x-0 z-20 flex justify-center items-center gap-3 font-semibold text-xs text-white/70 select-none">
                  <span className="hover:text-white cursor-pointer transition-colors">Abonnements</span>
                  <span className="text-white border-b-2 border-white pb-1 font-extrabold cursor-pointer">Pour toi</span>
                </div>

                {/* Right side overlays icons (Likes, Comments, Bookmarks, and User avatar) */}
                <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4.5 select-none">
                  
                  {/* Avatar ring */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full border border-white overflow-hidden bg-[#DD7E5C] text-white text-xs font-bold flex items-center justify-center select-none uppercase shrink-0">
                      {user?.name ? user.name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "GA"}
                    </div>
                    <span className="absolute -bottom-1 left-3 bg-[#EE1D52] text-white rounded-full w-3.5 h-3.5 text-[10px] flex items-center justify-center font-bold leading-none border border-white select-none pointer-events-none">+</span>
                  </div>

                  {/* Likes (Heart) */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="bg-white/10 p-2 rounded-full hover:bg-[#EE1D52] transition-colors cursor-pointer">
                      <Heart className="h-4.5 w-4.5 text-white fill-white" />
                    </button>
                    <span className="text-[9px] font-mono font-bold">4.2k</span>
                  </div>

                  {/* Comments */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="bg-white/10 p-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer">
                      <MessageSquare className="h-4.5 w-4.5 text-white" />
                    </button>
                    <span className="text-[9px] font-mono font-bold">312</span>
                  </div>

                  {/* Saved Bookmarks */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="bg-white/10 p-2 rounded-full hover:bg-yellow-500 transition-colors cursor-pointer">
                      <Bookmark className="h-4.5 w-4.5 text-white" />
                    </button>
                    <span className="text-[9px] font-mono font-bold">889</span>
                  </div>

                  {/* Share */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="bg-white/10 p-2 rounded-full hover:bg-[#EE1D52] transition-colors cursor-pointer">
                      <Share2 className="h-4.5 w-4.5 text-white" />
                    </button>
                    <span className="text-[9px] font-mono font-bold">120</span>
                  </div>

                  {/* Music Disk rotating loop */}
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800/90 flex items-center justify-center animate-spin" style={{ animationDuration: "5s" }}>
                    <Disc className="h-4.5 w-4.5 text-white/70" />
                  </div>

                </div>

                {/* Bottom narrative overlay captions */}
                <div className="absolute bottom-4 left-4 right-14 z-20 space-y-2 select-text">
                  <div className="flex items-center gap-1">
                    <strong className="text-xs hover:underline cursor-pointer">@{user?.name?.toLowerCase().replace(/\s/g, "") || "aprenx"}</strong>
                    <span className="text-[8px] bg-[#00f2fe]/40 text-cyan-200 border border-[#00f2fe]/60 rounded-xs px-1 font-mono uppercase">Créateur</span>
                  </div>
                  
                  <p className="text-[10px] font-medium leading-relaxed text-slate-100 max-h-16 overflow-y-auto select-text font-serif italic pr-2">
                    {postContent ? (postContent.slice(0, 150) + (postContent.length > 150 ? "..." : "")) : "Pas de contenu écrit ..."}
                  </p>

                  <div className="flex flex-wrap gap-1 text-[10px] text-cyan-300 font-bold select-text">
                    {tags.map(t => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>

                  {/* Audio line indicator block */}
                  <div className="flex items-center gap-1.5 text-[9px] text-white/50 font-mono py-0.5 overflow-hidden select-none">
                    <span className="animate-pulse">🎵</span>
                    <span className="truncate">Son original - @{user?.name?.toLowerCase().replace(/\s/g, "") || "aprenx"}</span>
                  </div>
                </div>

                {/* Bottom progress audio timeline bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                  <div className="bg-white h-1 w-2/5 rounded-r"></div>
                </div>

              </div>
            )}

            {/* VISUELS ASSOCIÉS panel at the bottom */}
            <div id="preview-associated-assets" className="w-full mt-6 bg-white rounded-xl p-5 border border-[#E3DEC3]/40">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#131211]/55 font-bold block mb-3">
                Visuels Associés
              </span>
              
              {visuals.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-[#E3DEC3]/50 rounded-lg bg-[#FAF8F5]/30">
                  <p className="text-[10px] text-gray-400 font-semibold">Aucun visuel — ajoutez des images dans la colonne de gauche</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {visuals.map((src, idx) => (
                    <div key={idx} className="relative group rounded border border-gray-100 aspect-video overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="asset display" referrerPolicy="no-referrer" />
                      <button 
                        id={`btn-del-asset-${idx}`}
                        onClick={() => handleRemoveVisual(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500/60 leading-none text-white transition-opacity select-none cursor-pointer text-xs"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
