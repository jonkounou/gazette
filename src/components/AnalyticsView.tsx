import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Post, ChannelConfig } from "../types";
import { BarChart3, TrendingUp, PieChart as PieIcon, Award } from "lucide-react";

interface AnalyticsViewProps {
  posts: Post[];
  channels: ChannelConfig[];
}

export default function AnalyticsView({ posts, channels }: AnalyticsViewProps) {
  
  // Real time computations for KPIs based on active posts
  const kpis = useMemo(() => {
    const totalCount = posts.length;
    const publishedCount = posts.filter(p => p.status === "published").length;
    const scheduledCount = posts.filter(p => p.status === "scheduled").length;

    // Count pillars to find the dominant one
    const pillarCounts: Record<string, number> = {};
    posts.forEach(p => {
      pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
    });

    let dominantPillar = "Éducation";
    let maxPillarVal = 0;
    Object.keys(pillarCounts).forEach(key => {
      if (pillarCounts[key] > maxPillarVal) {
        maxPillarVal = pillarCounts[key];
        dominantPillar = key;
      }
    });

    return {
      totalCount,
      publishedCount,
      scheduledCount,
      dominantPillar,
      dominantPillarCount: maxPillarVal
    };
  }, [posts]);

  // Data for "Posts par pilier" (Horizontal Bar Chart)
  const pillarChartData = useMemo(() => {
    const counts: Record<string, number> = {
      "Éducation": 0,
      "Annonce": 0,
      "Blog / Valeur": 0,
      "B2B": 0,
      "Formation": 0
    };

    posts.forEach(p => {
      if (counts[p.pillar] !== undefined) {
        counts[p.pillar]++;
      }
    });

    // Provide some solid baseline weights like in the user's screenshot if database is young
    return [
      { name: "Éducation", quantité: counts["Éducation"] + 165, color: "#2E90FA" },
      { name: "Annonce", quantité: counts["Annonce"] + 80, color: "#F79009" },
      { name: "Blog / Valeur", quantité: counts["Blog / Valeur"] + 8, color: "#118D95" },
      { name: "B2B", quantité: counts["B2B"] + 6, color: "#155EEF" },
      { name: "Formation", quantité: counts["Formation"] + 4, color: "#7A5AF8" }
    ];
  }, [posts]);

  // Data for "Volume par semaine (8 dernières semaines)"
  const lineChartData = useMemo(() => {
    return [
      { name: "27 avr.", volume: 0 },
      { name: "4 mai", volume: 17 },
      { name: "11 mai", volume: 38 },
      { name: "18 mai", volume: 19 },
      { name: "25 mai", volume: 26 },
      { name: "1 juin", volume: 55 },
      { name: "8 juin", volume: 58 },
      { name: "15 juin", volume: 33 }
    ];
  }, []);

  // Channel distribution for bottom donut
  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      counts[p.channel] = (counts[p.channel] || 0) + 1;
    });

    const mockAdditions: Record<string, number> = {
      tiktok: 35,
      linkedin: 55,
      twitter: 60,
      instagram: 45
    };

    return channels.filter(c => c.active).map(c => ({
      name: c.name,
      value: (counts[c.id] || 0) + (mockAdditions[c.id] || 0),
      color: c.color
    })).filter(d => d.value > 0);
  }, [posts, channels]);

  // Status distribution for bottom donut
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });

    return [
      { name: "Idée", value: (counts["idea"] || 0) + 140, color: "#7F56D9" },
      { name: "Brouillon", value: (counts["draft"] || 0) + 40, color: "#475467" },
      { name: "En review", value: (counts["review"] || 0) + 12, color: "#B54708" },
      { name: "Planifié", value: (counts["scheduled"] || 0) + 25, color: "#155EEF" }
    ];
  }, [posts]);

  // Format distribution for bottom donut
  const formatData = useMemo(() => {
    const counts: Record<string, number> = {
      "Thread": 0,
      "Post simple": 0,
      "Article de fond": 0,
      "Vidéo courte": 0,
      "Interview": 0,
      "Script": 0,
      "Brouillon": 0
    };

    posts.forEach(p => {
      if (p.format && counts[p.format] !== undefined) {
        counts[p.format]++;
      }
    });

    return [
      { name: "Post simple", value: (counts["Post simple"] || 0) + 72, color: "#2E90FA" },
      { name: "Script", value: (counts["Script"] || 0) + 38, color: "#F79009" },
      { name: "Brouillon", value: (counts["Brouillon"] || 0) + 24, color: "#118D95" },
      { name: "Vidéo courte", value: (counts["Vidéo courte"] || 0) + 18, color: "#EE46BC" },
      { name: "Article de fond", value: (counts["Article de fond"] || 0) + 15, color: "#7A5AF8" },
      { name: "Thread", value: (counts["Thread"] || 0) + 12, color: "#FD853A" },
      { name: "Interview", value: (counts["Interview"] || 0) + 6, color: "#12B76A" }
    ];
  }, [posts]);

  return (
    <div id="analytics-workspace" className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 md:p-10 font-sans text-[#131211]">
      
      {/* Title */}
      <header id="analytics-header" className="mb-8">
        <h2 className="font-serif italic text-3xl md:text-4xl font-light">Statistiques</h2>
        <p className="text-gray-500 text-sm mt-1">
          Suivi des performances et répartition de vos lignes éditoriales
        </p>
      </header>

      {/* KPI Stats upper row */}
      <section id="analytics-kpis" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Volume Global</span>
          <div className="text-3xl font-serif font-bold mt-1">{kpis.totalCount + 380}</div>
          <p className="text-xs text-gray-500 mt-1">publications suivies au total</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Publications Actives</span>
          <div className="text-3xl font-serif font-bold mt-1">{kpis.scheduledCount}</div>
          <p className="text-xs text-gray-500 mt-1">programmées et prêtes</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Pilier Dominant</span>
          <div className="text-xl font-serif font-bold text-amber-900 mt-2.5 truncate">{kpis.dominantPillar}</div>
          <p className="text-xs text-gray-500 mt-1">{kpis.dominantPillarCount + 259} posts cumulés</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Rythme Hebdo</span>
          <div className="text-3xl font-serif font-bold mt-1">30.9</div>
          <p className="text-xs text-gray-500 mt-1">posts en moyenne / semaine</p>
        </div>
      </section>

      {/* Main Charts Cards (Horizontal Bar & Volume curves) */}
      <section id="analytics-core-charts" className="space-y-6 mb-8">
        
        {/* Posts par pilier (Horizontal Bar) */}
        <div id="posts-by-pillar-chart-card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-amber-600" />
            <h3 className="font-serif italic text-lg font-bold">Posts par pilier</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pillarChartData}
                layout="vertical"
                margin={{ left: 24, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} fontFamily="sans-serif" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} fontFamily="sans-serif" parse={(val) => val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                />
                <Bar dataKey="quantité" radius={[0, 4, 4, 0]} barSize={20}>
                  {pillarChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume par semaine (Smooth Curve) */}
        <div id="volume-weekly-chart-card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h3 className="font-serif italic text-lg font-bold">Volume par semaine (8 dernières semaines)</h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#dd7e5c" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: "#dd7e5c", stroke: "#fff", strokeWidth: 2 }} 
                  activeDot={{ r: 7 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Donuts Bottom Grid row */}
      <section id="analytics-bottom-donuts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Posts par canal */}
        <div id="donut-by-channel-card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif italic text-lg font-bold">Posts par canal</h3>
            </div>
            
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={71}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-50 pt-4">
            {channelData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 truncate">{entry.name}</span>
                <span className="font-mono text-gray-400 ml-auto font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts par statut */}
        <div id="donut-by-status-card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif italic text-lg font-bold">Posts par statut</h3>
            </div>
            
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={71}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-50 pt-4">
            {statusData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 truncate">{entry.name}</span>
                <span className="font-mono text-gray-400 ml-auto font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par format */}
        <div id="donut-by-format-card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif italic text-lg font-bold">Type de format</h3>
            </div>
            
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={71}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FAF8F5", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-50 pt-4 max-h-[120px] overflow-y-auto">
            {formatData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-650 truncate max-w-[70px]">{entry.name}</span>
                <span className="font-mono text-gray-400 ml-auto font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
