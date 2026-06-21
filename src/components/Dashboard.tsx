import { useMemo } from "react";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Megaphone, 
  Linkedin, 
  Twitter, 
  Instagram, 
  BookOpen, 
  Mail, 
  Video, 
  Facebook,
  ChevronRight,
  Plus,
  Tag,
  Edit3,
  Check
} from "lucide-react";
import { Post, Campaign, ChannelConfig, PostStatus } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface DashboardProps {
  posts: Post[];
  campaigns: Campaign[];
  channels: ChannelConfig[];
  userName: string;
  brandTheme?: string;
  brandThemeTags?: string[];
  onUpdateThemeTags?: (tagsList: string[]) => void;
  onNavigateToCalendar: () => void;
  onOpenNewPostModal: (dateString?: string) => void;
  onSelectPost: (post: Post) => void;
}

export default function Dashboard({ 
  posts, 
  campaigns, 
  channels, 
  userName, 
  brandTheme = "",
  brandThemeTags = [],
  onUpdateThemeTags,
  onNavigateToCalendar, 
  onOpenNewPostModal,
  onSelectPost
}: DashboardProps) {
  
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInputText, setTagInputText] = useState(() => brandThemeTags.join(", "));

  const handleStartEdit = () => {
    setTagInputText(brandThemeTags.join(", "));
    setIsEditingTags(true);
  };

  const handleSaveTags = () => {
    if (onUpdateThemeTags) {
      const parsed = tagInputText
        .split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);
      onUpdateThemeTags(parsed);
    }
    setIsEditingTags(false);
  };

  // Hardcoded current mock date according to requested image context: 21 June 2026
  const CURRENT_MOCK_DATE = "2026-06-21";
  const displayDateString = "Dimanche 21 juin 2026";

  // Dynamic calculations based on state
  const stats = useMemo(() => {
    // 1. Posts this week (June 15 to June 21)
    const weekStart = new Date("2026-06-15");
    const weekEnd = new Date("2026-06-21");
    const thisWeekPosts = posts.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= weekStart && pDate <= weekEnd;
    });

    // 2. Overdue posts (En retard): posts before CURRENT_MOCK_DATE that are not published
    const overduePosts = posts.filter(p => p.date < CURRENT_MOCK_DATE && p.status !== "published");

    // 3. Completion rate of the week or total
    const publishedCount = thisWeekPosts.filter(p => p.status === "published").length;
    const totalWeekCount = thisWeekPosts.length;
    const completionRate = totalWeekCount > 0 ? Math.round((publishedCount / totalWeekCount) * 100) : 0;

    // 4. Next campaign or current campaign
    const currentCampaign = campaigns.find(c => c.startDate <= CURRENT_MOCK_DATE && c.endDate >= CURRENT_MOCK_DATE);

    return {
      weekCount: thisWeekPosts.length,
      overdueCount: overduePosts.length,
      completionRate,
      campaignName: currentCampaign ? currentCampaign.name : "Aucune",
      publishedWeekCount: publishedCount
    };
  }, [posts, campaigns]);

  // Donut chart of posts per active channel
  const channelChartData = useMemo(() => {
    const counts = channels.reduce((acc, ch) => {
      acc[ch.id] = 0;
      return acc;
    }, {} as Record<string, number>);

    posts.forEach(p => {
      if (counts[p.channel] !== undefined) {
        counts[p.channel]++;
      }
    });

    return Object.keys(counts).map(key => {
      const ch = channels.find(c => c.id === key);
      return {
        name: ch?.name || key,
        value: counts[key],
        color: ch?.color || "#98A2B3",
        active: ch?.active
      };
    }).filter(d => d.value > 0 && d.active);
  }, [posts, channels]);

  // Week days checklist helper (June 15 - June 21)
  const weekDays = [
    { name: "lun", dayNum: "15", dateStr: "2026-06-15" },
    { name: "mar", dayNum: "16", dateStr: "2026-06-16" },
    { name: "mer", dayNum: "17", dateStr: "2026-06-17" },
    { name: "jeu", dayNum: "18", dateStr: "2026-06-18" },
    { name: "ven", dayNum: "19", dateStr: "2026-06-19" },
    { name: "sam", dayNum: "20", dateStr: "2026-06-20" },
    { name: "dim", dayNum: "21", dateStr: "2026-06-21" }
  ];

  const getDayPosts = (dateStr: string) => {
    return posts.filter(p => p.date === dateStr);
  };

  const getChannelIcon = (id: string, className = "h-3 w-3") => {
    switch (id) {
      case "linkedin": return <Linkedin className={className} />;
      case "twitter": return <Twitter className={className} />;
      case "instagram": return <Instagram className={className} />;
      case "blog": return <BookOpen className={className} />;
      case "newsletter": return <Mail className={className} />;
      case "tiktok": return <Video className={className} />;
      case "facebook": return <Facebook className={className} />;
      default: return null;
    }
  };

  const recentPosts = useMemo(() => {
    return [...posts]
      .filter(p => p.status === "published" || p.status === "scheduled")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [posts]);

  const unfinalizedTodayPosts = useMemo(() => {
    return posts.filter(p => p.date === CURRENT_MOCK_DATE && p.status !== "published");
  }, [posts]);

  return (
    <div id="dashboard-container" className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 md:p-10 text-gray-800 font-sans">
      
      {/* Welcome Banner */}
      <header id="dashboard-header" className="flex-col md:flex-row flex md:items-baseline justify-between gap-4 mb-10 pb-4 border-b border-[#E3DEC3]/20">
        <div>
          <h2 className="font-serif italic text-4xl md:text-5xl tracking-tight text-[#131211] font-light">
            Bonjour, {userName}.
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1.5 tracking-wide">
            dimanche 21 juin 2026 — {stats.weekCount} {stats.weekCount > 1 ? "publications" : "publication"} prévue{stats.weekCount > 1 ? "s" : ""} cette semaine.
          </p>
        </div>
        <button
          id="new-publication-quick-btn"
          onClick={() => onOpenNewPostModal()}
          className="bg-[#131211] hover:bg-black text-[#FAF8F5] transition-colors py-2 px-3.5 rounded text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nouveau post
        </button>
      </header>

      {/* Unfinalized Scheduled Today Alerts */}
      {unfinalizedTodayPosts.length > 0 && (
        <div 
          id="unfinalized-today-alert" 
          className="mb-8 p-5 bg-amber-50/40 border border-amber-200/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-100/60 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-[#131211] font-bold text-base">
                Fichier de vigilance : {unfinalizedTodayPosts.length} publication{unfinalizedTodayPosts.length > 1 ? "s" : ""} prévue{unfinalizedTodayPosts.length > 1 ? "s" : ""} aujourd'hui n'est pas encore finalisée.
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                La date cible de diffusion est aujourd'hui mais le statut n'est pas encore « publié ». Cliquez sur une publication ci-dessous pour la peaufiner.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {unfinalizedTodayPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-amber-50/20 border border-[#E3DEC3]/40 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: channels.find(c => c.id === post.channel)?.color || "#98A2B3" }}
                    />
                    <span className="truncate max-w-[160px]">{post.title}</span>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1 rounded font-bold uppercase shrink-0">
                      {post.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0">
            <button
              onClick={onNavigateToCalendar}
              className="text-xs font-semibold bg-[#131211] hover:bg-black text-[#FAF8F5] py-2.5 px-4 rounded transition-colors cursor-pointer"
            >
              Consulter le calendrier
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <section id="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Weekly Posts */}
        <div id="kpi-card-week-posts" className="bg-white rounded-xl p-5 border border-[#E3DEC3]/40 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-mono">SEMAINE</span>
          <div className="flex items-baseline gap-1.5 mt-4">
            <span className="text-3xl font-serif italic text-[#131211] font-light">{stats.weekCount}</span>
            <span className="text-xs text-gray-500 font-serif italic">posts</span>
          </div>
        </div>

        {/* Overdue/Late */}
        <div id="kpi-card-overdue" className="bg-white rounded-xl p-5 border border-[#E3DEC3]/40 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-mono">RETARD</span>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-serif italic text-[#131211] font-light">
              {stats.overdueCount < 10 ? `0${stats.overdueCount}` : stats.overdueCount}
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div id="kpi-card-completion" className="bg-white rounded-xl p-5 border border-[#E3DEC3]/40 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-mono">COMPLÉTION</span>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-serif italic text-[#131211] font-light">{stats.completionRate}%</span>
          </div>
        </div>

        {/* Total Published */}
        <div id="kpi-card-campaign" className="bg-white rounded-xl p-5 border border-[#E3DEC3]/40 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-mono">TOTAL PUBLIÉS</span>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-serif italic text-[#131211] font-light">
              {posts.filter(p => p.status === "published").length}
            </span>
          </div>
        </div>
      </section>

      {/* Grid: Weekly planner + Donut chart */}
      <section id="dashboard-mid-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Weekly Micro-Planner */}
        <div id="planner-week-widget" className="bg-white rounded-xl p-6 border border-[#E3DEC3]/40 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans font-semibold text-lg text-[#131211]">Planning hebdomadaire</h3>
            <button 
              id="dashboard-goto-calendar-btn"
              onClick={onNavigateToCalendar}
              className="text-xs font-semibold text-[#DD7E5C] hover:text-[#c45a37] flex items-center gap-1 cursor-pointer"
            >
              <span>Calendrier</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 border-b border-[#E3DEC3]/20 pb-4 mb-4">
            {weekDays.map(wd => {
              const dayPostsList = getDayPosts(wd.dateStr);
              const isActive = wd.dateStr === CURRENT_MOCK_DATE;
              return (
                <div 
                  id={`planner-day-${wd.dayNum}`}
                  key={wd.dayNum}
                  onClick={() => onOpenNewPostModal(wd.dateStr)}
                  className={`flex flex-col items-center p-2.5 rounded-lg transition-all cursor-pointer group ${
                    isActive 
                      ? "bg-[#FEF2E8] border border-[#F3DEC3]" 
                      : "hover:bg-gray-50/85 border border-transparent"
                  }`}
                >
                  <span className={`text-[9px] uppercase font-mono font-bold tracking-wider ${
                    isActive ? "text-[#DD7E5C]" : "text-gray-400"
                  }`}>{wd.name}</span>
                  <span className={`text-lg font-serif italic font-light mt-1.5 inline-block text-center rounded-full leading-none ${
                    isActive ? "text-[#DD7E5C]" : "text-[#131211]"
                  }`}>
                    {wd.dayNum}
                  </span>
                  
                  {/* Miniature channel indicator circles */}
                  <div className="flex gap-0.5 mt-2 justify-center flex-wrap min-h-[14px]">
                    {dayPostsList.slice(0, 3).map((p, idx) => (
                      <span 
                        key={p.id || idx} 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: channels.find(c => c.id === p.channel)?.color || "#98A2B3" }}
                        title={p.title}
                      />
                    ))}
                    {dayPostsList.length > 3 && (
                      <span className="text-[7px] text-gray-500 font-mono font-black">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick agenda for current day */}
          <div id="today-agenda-list" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">Aujourd'hui, {displayDateString}</span>
              <span className="text-xs text-gray-500">{getDayPosts(CURRENT_MOCK_DATE).length} publications</span>
            </div>

            {getDayPosts(CURRENT_MOCK_DATE).length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-medium bg-gray-50 rounded-lg">
                Aucune publication programmée aujourd'hui. <button onClick={() => onOpenNewPostModal(CURRENT_MOCK_DATE)} className="text-amber-700 hover:underline cursor-pointer">Ajouter une idée ?</button>
              </div>
            ) : (
              <div className="space-y-2">
                {getDayPosts(CURRENT_MOCK_DATE).map(post => (
                  <div 
                    id={`agenda-post-${post.id}`}
                    key={post.id} 
                    onClick={() => onSelectPost(post)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded text-white" style={{ backgroundColor: channels.find(c => c.id === post.channel)?.color || "#ccc" }}>
                        {getChannelIcon(post.channel)}
                      </div>
                      <span className="text-sm font-semibold truncate max-w-[280px]">{post.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500 font-medium">{post.time || "--:--"}</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Donut Distribution */}
        <div id="posts-by-channel-widget" className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-serif italic text-lg text-[#131211] font-bold mb-4">Par canal</h3>
            {channelChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                Données insuffisantes.
              </div>
            ) : (
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ fontFamily: "sans-serif", fontSize: "11px", backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-50 pt-3">
            {channelChartData.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 truncate">{entry.name}</span>
                <span className="font-mono text-gray-400 ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom widgets: Recent posts list & Campagnes */}
      <section id="dashboard-lower-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent posts */}
        <div id="posts-recent-widget" className="bg-white rounded-xl p-6 border border-[#E3DEC3]/40 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-sans font-semibold text-lg text-[#131211]">Dernières publications</h3>
            <button 
              id="dashboard-see-all-posts"
              onClick={onNavigateToCalendar}
              className="text-xs font-semibold text-[#DD7E5C] hover:text-[#c45a37] inline-block cursor-pointer"
            >
              Voir tout →
            </button>
          </div>

          <div id="recent-posts-feed" className="divide-y divide-gray-100">
            {recentPosts.map(post => {
              const channelObj = channels.find(c => c.id === post.channel);
              return (
                <div 
                  id={`recent-${post.id}`}
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="py-3 px-1 flex items-center justify-between hover:bg-gray-50/50 rounded-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: channelObj?.color || "#98A2B3" }}
                      title={channelObj?.name}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate text-[#131211] group-hover:text-amber-900 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        {post.date} {post.time ? `• ${post.time}` : ""}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium font-mono text-gray-400 uppercase bg-gray-50 p-1.5 rounded leading-none shrink-0 border border-gray-100">
                    {post.pillar}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thématique & Tags associés */}
        <div id="theme-tags-list-widget" className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-serif italic text-lg text-[#131211] font-bold mb-4 flex items-center justify-between">
              <span>Thématique principale</span>
              {!isEditingTags && (
                <button 
                  onClick={handleStartEdit}
                  title="Modifier les mots-clés de la thématique"
                  className="text-xs text-gray-400 hover:text-[#DD7E5C] flex items-center gap-1 font-sans cursor-pointer transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Modifier</span>
                </button>
              )}
            </h3>
            
            <div className="p-3 bg-amber-50/20 rounded-lg border border-amber-150 mb-4">
              <p className="text-xs font-serif font-semibold text-[#131211] leading-relaxed">
                {brandTheme || "Aucune thématique configurée."}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                Tags associés au thème principal
              </label>

              {isEditingTags ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tagInputText}
                    onChange={(e) => setTagInputText(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full text-xs p-2 rounded-lg border border-[#E3DEC3]/40 focus:outline-none focus:ring-1 focus:ring-[#DD7E5C] font-mono"
                  />
                  <p className="text-[10px] text-gray-400 font-sans">
                    Séparez les tags par des virgules.
                  </p>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setIsEditingTags(false)}
                      className="text-[10px] font-semibold border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveTags}
                      className="text-[10px] font-semibold bg-[#131211] text-[#FAF8F5] px-2.5 py-1 rounded hover:bg-black flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5" id="theme-tags-container">
                  {brandThemeTags.map((tag, idx) => (
                    <span 
                      key={`${tag}-${idx}`}
                      className="text-[10px] font-semibold font-sans bg-gray-100 hover:bg-gray-200 text-gray-750 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Tag className="h-2 w-2 text-gray-400" />
                      #{tag}
                    </span>
                  ))}
                  {brandThemeTags.length === 0 && (
                    <span className="text-xs text-gray-400 italic">Aucun tag enregistré.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div id="theme-tags-widget-footer" className="text-center pt-3 border-t border-gray-50 text-[11px] text-[#DD7E5C] font-serif font-semibold mt-4">
            Veille active & suggestions synchronisées
          </div>
        </div>
      </section>
    </div>
  );
}
