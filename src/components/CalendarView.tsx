import { useState, useMemo } from "react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Linkedin, 
  Twitter, 
  Instagram, 
  BookOpen, 
  Mail, 
  Video, 
  Facebook,
  Grid,
  List,
  CalendarDays,
  X
} from "lucide-react";
import { Post, ChannelConfig, Campaign, PostStatusConfig } from "../types";

interface CalendarViewProps {
  posts: Post[];
  channels: ChannelConfig[];
  campaigns: Campaign[];
  statusConfigs: PostStatusConfig[];
  onOpenNewPostModal: (dateString?: string) => void;
  onSelectPost: (post: Post) => void;
}

type CalendarViewMode = "month" | "week" | "list";

export default function CalendarView({
  posts,
  channels,
  campaigns,
  statusConfigs,
  onOpenNewPostModal,
  onSelectPost
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // June is index 5
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");

  const monthName = "Juin"; // Keep static as in our user-case mockup screenshot

  // Filter posts dynamically 
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search matches title or content
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Channel matches
      const matchesChannel = filterChannel === "all" || post.channel === filterChannel;

      // Status matches
      const matchesStatus = filterStatus === "all" || post.status === filterStatus;

      // Campaign matches
      const matchesCampaign = filterCampaign === "all" || post.campaign === filterCampaign;

      return matchesSearch && matchesChannel && matchesStatus && matchesCampaign;
    });
  }, [posts, searchQuery, filterChannel, filterStatus, filterCampaign]);

  // Icons helper
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

  // Reset Filters helper
  const resetFilters = () => {
    setSearchQuery("");
    setFilterChannel("all");
    setFilterStatus("all");
    setFilterCampaign("all");
  };

  // Days mapping for June 2026 (starts on Monday, June 1, 30 days)
  const june2026Days = useMemo(() => {
    const days = [];
    // 30 days in June
    for (let i = 1; i <= 30; i++) {
      const dateString = `2026-06-${i.toString().padStart(2, "0")}`;
      days.push({
        num: i,
        dateStr: dateString,
        isCurrentMonth: true
      });
    }
    return days;
  }, []);

  return (
    <div id="calendar-workspace" className="flex-1 flex flex-col h-screen bg-[#FAF8F5] overflow-hidden">
      
      {/* Calendar Header section */}
      <section id="calendar-header-panel" className="bg-[#FAF8F5] border-b border-[#E3DEC3]/20 p-6 flex flex-col gap-4 shrink-0">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-serif italic text-4xl tracking-tight text-[#131211] font-light">
              {monthName} {selectedYear}
            </h2>
            <p className="text-xs text-gray-500 font-mono tracking-wide mt-1.5">
              Vue mensuelle de la rédaction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pagination Controls */}
            <div className="flex items-center gap-1 bg-white border border-[#E3DEC3]/40 rounded-lg p-0.5 shadow-2xs">
              <button 
                id="cal-prev-btn"
                title="Précédent"
                className="p-1.5 hover:bg-gray-50 rounded-md text-gray-400 hover:text-gray-800 transition-colors"
                disabled
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                id="cal-today-btn"
                className="px-3 py-1 font-mono text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md transition-all shrink-0"
              >
                Aujourd'hui
              </button>
              <button 
                id="cal-next-btn"
                title="Suivant"
                className="p-1.5 hover:bg-gray-50 rounded-md text-gray-400 hover:text-gray-800 transition-colors"
                disabled
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* View Selection switch (Month, Week, List) */}
            <div className="flex bg-white border border-[#E3DEC3]/40 rounded-lg p-0.5 shadow-2xs">
              <button
                id="view-month-btn"
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${
                  viewMode === "month" 
                    ? "bg-[#131211] text-[#FAF8F5]" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Mois
              </button>
              <button
                id="view-week-btn"
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${
                  viewMode === "week" 
                    ? "bg-[#131211] text-[#FAF8F5]" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Semaine
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${
                  viewMode === "list" 
                    ? "bg-[#131211] text-[#FAF8F5]" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Liste
              </button>
            </div>

            <button 
              id="calendar-add-btn"
              onClick={() => onOpenNewPostModal()}
              className="bg-[#131211] hover:bg-black text-[#FAF8F5] transition-colors py-2 px-3.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              Nouveau post
            </button>
          </div>
        </div>

        {/* Curation Filter & Search bar layout */}
        <div id="calendar-filters-row" className="flex items-center gap-3 flex-wrap bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
          {/* Text search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search-posts-input"
              type="text"
              placeholder="Rechercher une publication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border-none text-[#131211] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-lg text-xs pl-9 pr-4 py-2"
            />
          </div>

          {/* Channel selector */}
          <select
            id="filter-channel-dropdown"
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-[#FAF8F5] border-none hover:bg-gray-50 text-[#131211] text-xs py-2 px-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium shrink-0 cursor-pointer"
          >
            <option value="all">Canal (Tous)</option>
            {channels.filter(c => c.active).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status selector */}
          <select
            id="filter-status-dropdown"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FAF8F5] border-none hover:bg-gray-50 text-[#131211] text-xs py-2 px-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium shrink-0 cursor-pointer"
          >
            <option value="all">Statut (Tous)</option>
            {statusConfigs.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.label}</option>
            ))}
          </select>

          {/* Reset button if any filter active */}
          {(searchQuery !== "" || filterChannel !== "all" || filterStatus !== "all") && (
            <button
              id="reset-filters"
              onClick={resetFilters}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 font-mono uppercase font-bold tracking-wide"
            >
              <X className="h-3 w-3" /> Effacer
            </button>
          )}
        </div>
      </section>

      {/* Main Grid Viewport */}
      <div id="calendar-viewport-content" className="flex-1 overflow-auto p-6 bg-[#FAF8F5]">
        
        {viewMode === "month" && (
          <div id="view-mode-month-grid" className="h-full flex flex-col">
            {/* Days header (LUN, MAR, MER...) */}
            <div id="calendar-weekdays-header" className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono tracking-widest uppercase text-gray-400 mb-2 font-bold select-none py-1 border-b border-gray-100">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
            </div>

            {/* Days Grid cells */}
            <div id="calendar-days-panel" className="grid grid-cols-5 gap-2 flex-grow auto-rows-fr">
              {june2026Days.map((day) => {
                const dayPosts = filteredPosts.filter(p => p.date === day.dateStr);
                const dayOfWeek = new Date(day.dateStr).getDay(); // 0 is Sunday, 6 is Saturday
                
                // Hide weekends to prioritize the 5 core workdays view like in Image 6
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                  return null;
                }

                return (
                  <div
                    id={`cal-day-${day.num}`}
                    key={day.num}
                    className="bg-[#FAF8F5] border border-gray-200/50 hover:border-amber-300 rounded-xl p-2.5 flex flex-col transition-all group overflow-hidden cursor-pointer min-h-[145px]"
                    onClick={(e) => {
                      // Prevent bubble triggering if clicked on inner posts
                      if (e.target === e.currentTarget) {
                        onOpenNewPostModal(day.dateStr);
                      }
                    }}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-serif font-bold text-gray-400 group-hover:text-amber-800 transition-colors">
                        {day.num}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[9px] text-gray-400 font-mono">
                          {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Posts list inside day cell */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                      {dayPosts.slice(0, 3).map((post) => {
                        const channelObj = channels.find(c => c.id === post.channel);
                        return (
                          <div
                            id={`cal-post-node-${post.id}`}
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPost(post);
                            }}
                            className="text-[10px] font-medium p-1 rounded-md border border-gray-100 bg-white flex items-center gap-1.5 hover:shadow-xs hover:border-amber-200 transition-all cursor-pointer truncate"
                            title={`${post.title}\n[${channelObj?.name}] • ${post.status}`}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full shrink-0" 
                              style={{ backgroundColor: channelObj?.color || "#98A2B3" }}
                            />
                            <span className="truncate text-gray-700 leading-none">{post.title}</span>
                          </div>
                        );
                      })}

                      {dayPosts.length > 3 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNewPostModal(day.dateStr);
                          }}
                          className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 rounded p-1 text-center hover:bg-amber-100 transition-colors cursor-pointer block leading-none"
                        >
                          +{dayPosts.length - 3} de plus...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div id="view-mode-week-list" className="space-y-6">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest pl-2 block">
              Publications de la semaine en cours (21 Juin au 26 Juin)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {june2026Days.slice(20, 25).map((day) => {
                const dayPosts = filteredPosts.filter(p => p.date === day.dateStr);
                return (
                  <div id={`week-day-col-${day.num}`} key={day.num} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 min-h-[300px]">
                    <div className="pb-2 border-b border-gray-50 flex items-center justify-between">
                      <span className="text-sm font-serif font-bold text-gray-800">Jour {day.num}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{day.dateStr}</span>
                    </div>

                    <div className="flex-1 space-y-2.5">
                      {dayPosts.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-4">
                          <p className="text-[11px] text-gray-400 italic">Aucune publication</p>
                        </div>
                      ) : (
                        dayPosts.map(post => (
                          <div
                            id={`week-post-${post.id}`}
                            key={post.id}
                            onClick={() => onSelectPost(post)}
                            className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-amber-50/20 hover:border-amber-200 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: channels.find(c => c.id === post.channel)?.color }}
                              />
                              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                                {post.channel}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "list" && (
          <div id="view-mode-list-panel" className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-serif italic text-lg font-bold text-gray-800">Flux chronologique des publications</h3>
              <span className="text-xs text-gray-400 font-mono">{filteredPosts.length} éléments trouvés</span>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Aucun résultat ne correspond à vos filtres.
                </div>
              ) : (
                filteredPosts.map(post => {
                  const ch = channels.find(c => c.id === post.channel);
                  return (
                    <div
                      id={`list-row-${post.id}`}
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/40 p-2 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div 
                          className="p-1.5 rounded-md text-white shrink-0" 
                          style={{ backgroundColor: ch?.color || "#98A2B3" }}
                        >
                          {getChannelIcon(post.channel)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-amber-800 transition-colors">
                            {post.title}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            Planifié pour le {post.date} à {post.time || "09:00"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <span className="text-[10px] py-1 px-2 font-mono font-medium rounded uppercase bg-slate-100 text-slate-700">
                          {post.pillar}
                        </span>
                        <span className="text-[10px] py-1 px-2 font-mono font-bold rounded uppercase bg-amber-50 text-amber-800 border border-amber-100">
                          {post.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
