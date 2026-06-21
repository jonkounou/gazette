import React, { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Sparkles, 
  Clock, 
  Loader2, 
  Linkedin, 
  Twitter, 
  Instagram, 
  BookOpen, 
  Mail, 
  Video, 
  Facebook, 
  MessageSquare,
  Bookmark,
  Share2,
  AlertCircle
} from "lucide-react";
import { Post, User, ChannelConfig, CurationItem, EditorialPillar, PostStatus } from "./types";
import { INITIAL_POSTS, INITIAL_CHANNELS, INITIAL_CAMPAIGNS, STATUS_CONFIGS, INITIAL_CURATION } from "./mockData";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";

// Views
import LoginView from "./components/LoginView";
import Sidebar, { ActiveTab } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import CurationView from "./components/CurationView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import PostEditorView from "./components/PostEditorView";
import SetupWizardView from "./components/SetupWizardView";

export default function App() {
  const [systemLoading, setSystemLoading] = useState(true);

  // Authentication state
  const [user, setUser] = useState<User | null>(null);

  // Editorial Entities persisted lists
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<ChannelConfig[]>(INITIAL_CHANNELS);
  const [campaigns] = useState(INITIAL_CAMPAIGNS);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [brandTheme, setBrandTheme] = useState("");
  const [brandThemeTags, setBrandThemeTags] = useState<string[]>(["veille", "ia", "tech", "innovation", "formation"]);
  const [brandName, setBrandName] = useState("AprenX");
  const [showSetup, setShowSetup] = useState(false);

  // Active view router
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Multi-purpose Post Modal State (Create and Edit)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form inputs
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postChannel, setPostChannel] = useState<any>("linkedin");
  const [postStatus, setPostStatus] = useState<PostStatus>("idea");
  const [postPillar, setPostPillar] = useState<EditorialPillar>("Education");
  const [postCampaign, setPostCampaign] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postTime, setPostTime] = useState("09:00");
  const [postFormat, setPostFormat] = useState("Post simple");
  const [postPhase, setPostPhase] = useState("Evergreen");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [postVisuals, setPostVisuals] = useState<string[]>([]);

  // Gemini Copywriter overlay inside Modal
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiTone, setAiTone] = useState("Professionnel");
  const [aiImprovement, setAiImprovement] = useState("Rendre le ton plus percutant");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Firebase auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        let loadedChannels = INITIAL_CHANNELS;
        let loadedTheme = "";
        let loadedThemeTags = ["veille", "ia", "tech", "innovation", "formation"];
        let loadedBrandName = firebaseUser.displayName || "AprenX";
        let isNew = false;

        try {
          // Fetch settings
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            loadedTheme = data.brandTheme || "";
            loadedThemeTags = data.brandThemeTags || loadedThemeTags;
            loadedBrandName = data.brandName || loadedBrandName;
            if (data.channels) {
              loadedChannels = data.channels;
            }
          } else {
            isNew = true;
          }

          // Fetch posts
          const postsCollRef = collection(db, "users", uid, "posts");
          const postsSnap = await getDocs(postsCollRef);
          const loadedPosts: Post[] = [];
          postsSnap.forEach((docSnap) => {
            loadedPosts.push({ id: docSnap.id, ...docSnap.data() } as Post);
          });
          loadedPosts.sort((a, b) => b.date.localeCompare(a.date));

          // Fetch curation items
          const curationCollRef = collection(db, "users", uid, "curation");
          const curationSnap = await getDocs(curationCollRef);
          const loadedCuration: CurationItem[] = [];
          curationSnap.forEach((docSnap) => {
            loadedCuration.push({ id: docSnap.id, ...docSnap.data() } as CurationItem);
          });

          setBrandName(loadedBrandName);
          setBrandTheme(loadedTheme);
          setBrandThemeTags(loadedThemeTags);
          setChannels(loadedChannels);
          setPosts(loadedPosts);
          setCurationItems(loadedCuration);
          
          setUser({
            email: firebaseUser.email || "",
            name: loadedBrandName,
            role: "Rédacteur en chef",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
            isNewUser: isNew
          });
          
          if (!loadedTheme) {
            setShowSetup(true);
          } else {
            setShowSetup(false);
          }
        } catch (err) {
          console.error("Erreur d'initialisation Firebase Firestore:", err);
          setUser({
            email: firebaseUser.email || "",
            name: loadedBrandName,
            role: "Rédacteur en chef",
          });
        }
      } else {
        setUser(null);
        setPosts([]);
        setCurationItems([]);
        setBrandTheme("");
        setBrandThemeTags(["veille", "ia", "tech", "innovation", "formation"]);
        setChannels(INITIAL_CHANNELS);
        setShowSetup(false);
      }
      setSystemLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateThemeTags = async (tagsList: string[]) => {
    setBrandThemeTags(tagsList);
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { brandThemeTags: tagsList });
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    setIsPostModalOpen(false);
  }, [activeTab]);

  // Auth routing actions
  const handleLogin = (newUser: User) => {
    // onAuthStateChanged will handle settings state loading automatically!
    setUser(newUser);
  };

  const handleLogout = async () => {
    setSystemLoading(true);
    await auth.signOut();
  };

  // Reset & reseed database actions
  const handleClearAllPosts = async () => {
    if (confirm("Voulez-vous vraiment effacer tout votre historique de publications ?")) {
      setPosts([]);
      setCurationItems([]);
      if (auth.currentUser) {
        try {
          const uid = auth.currentUser.uid;
          for (const p of posts) {
            await deleteDoc(doc(db, "users", uid, "posts", p.id));
          }
          for (const c of curationItems) {
            await deleteDoc(doc(db, "users", uid, "curation", c.id));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleResetTheme = async () => {
    setPosts([]);
    setCurationItems([]);
    setBrandTheme("");
    setShowSetup(true);
    setBrandThemeTags(["veille", "ia", "tech", "innovation", "formation"]);
    if (auth.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        await updateDoc(doc(db, "users", uid), {
          brandTheme: "",
          brandThemeTags: ["veille", "ia", "tech", "innovation", "formation"]
        });
        for (const p of posts) {
          await deleteDoc(doc(db, "users", uid, "posts", p.id));
        }
        for (const c of curationItems) {
          await deleteDoc(doc(db, "users", uid, "curation", c.id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLoadDemoPosts = async () => {
    setPosts(INITIAL_POSTS);
    setCurationItems(INITIAL_CURATION);
    if (auth.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        for (const p of INITIAL_POSTS) {
          await setDoc(doc(db, "users", uid, "posts", p.id), p);
        }
        for (const c of INITIAL_CURATION) {
          await setDoc(doc(db, "users", uid, "curation", c.id), c);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSetupComplete = async (setupData: {
    brandName: string;
    brandSlogan: string;
    posts: Post[];
    curationItems: CurationItem[];
    theme: string;
  }) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setSystemLoading(true);

    try {
      const generatedTags = Array.from(new Set(setupData.posts.flatMap(p => p.tags || []))).filter(Boolean);
      const initialTags = generatedTags.length > 0 ? generatedTags : ["veille", "ia", "tech", "innovation", "formation"];

      // Save user metrics in firebase
      await setDoc(doc(db, "users", uid), {
         brandName: setupData.brandName,
         brandTheme: setupData.theme,
         brandThemeTags: initialTags,
         channels: channels,
         email: auth.currentUser.email || "",
         role: "Rédacteur en chef"
      }, { merge: true });

      // Save generated posts
      for (const p of setupData.posts) {
        await setDoc(doc(db, "users", uid, "posts", p.id), p);
      }

      // Save curation items
      for (const c of setupData.curationItems) {
        await setDoc(doc(db, "users", uid, "curation", c.id), c);
      }

      setBrandName(setupData.brandName);
      setPosts(setupData.posts);
      setCurationItems(setupData.curationItems);
      setBrandTheme(setupData.theme);
      setBrandThemeTags(initialTags);
      
      if (user) {
        setUser({ ...user, name: setupData.brandName });
      }
      setShowSetup(false);
    } catch (err) {
      console.error("Erreur d'écriture setup complet:", err);
    } finally {
      setSystemLoading(false);
    }
  };

  // Open modal for editing a post
  const handleSelectPost = (post: Post) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostChannel(post.channel);
    setPostStatus(post.status);
    setPostPillar(post.pillar);
    setPostCampaign(post.campaign || "");
    setPostDate(post.date);
    setPostTime(post.time || "09:00");
    setPostFormat(post.format || "Post simple");
    setPostPhase(post.phase || "Evergreen");
    setPostTags(post.tags || brandThemeTags);
    setPostVisuals(post.visuals || []);
    setShowAiAssistant(false);
    setAiResult("");
    setAiError("");
    setIsPostModalOpen(true);
  };

  // Open modal for creating a brand new post
  const handleOpenNewPostModal = (preselectedDate?: string) => {
    setEditingPost(null);
    setPostTitle("");
    setPostContent("");
    
    const firstActive = channels.find(c => c.active);
    setPostChannel(firstActive ? firstActive.id : "linkedin");
    
    setPostStatus("idea");
    setPostPillar("Education");
    setPostCampaign("");
    setPostDate(preselectedDate || "2026-06-21");
    setPostTime("09:00");
    setPostFormat("Post simple");
    setPostPhase("Evergreen");
    setPostTags(brandThemeTags);
    setPostVisuals([]);
    setShowAiAssistant(false);
    setAiResult("");
    setAiError("");
    setIsPostModalOpen(true);
  };

  // Trigger modal when user clicks "Rédiger" on a hot story card
  const handleCurationToPost = (item: CurationItem) => {
    setEditingPost(null);
    setPostTitle(`Focus: ${item.title}`);
    setPostContent(`Nous suivons de près cette tendance :\n\n${item.summary}\n\nQu'en pensez-vous ?`);
    
    const firstActive = channels.find(c => c.active);
    setPostChannel(firstActive ? firstActive.id : "linkedin");
    
    setPostStatus("idea");
    setPostPillar("Education");
    setPostCampaign("");
    setPostDate("2026-06-21");
    setPostTime("09:00");
    setPostFormat("Post simple");
    setPostPhase("Tendance");
    setPostTags(["veille", "recherche", "ia"]);
    setPostVisuals([]);
    setShowAiAssistant(true);
    setAiResult("");
    setAiError("");
    
    setActiveTab("calendar");
    setIsPostModalOpen(true);
  };

  // Delete a post
  const handleDeletePost = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
      setPosts(prev => prev.filter(p => p.id !== id));
      setIsPostModalOpen(false);
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, "users", auth.currentUser.uid, "posts", id));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // Save or update post in state
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    if (editingPost) {
      // Edit mode
      const updatedPost = {
        ...editingPost,
        title: postTitle,
        content: postContent,
        channel: postChannel,
        status: postStatus,
        pillar: postPillar,
        campaign: postCampaign || "",
        date: postDate,
        time: postTime,
        format: postFormat,
        phase: postPhase,
        tags: postTags,
        visuals: postVisuals
      };

      setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid, "posts", editingPost.id), updatedPost);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      // Create mode
      const newId = `post-${Date.now()}`;
      const newPost: Post = {
        id: newId,
        title: postTitle,
        content: postContent,
        channel: postChannel,
        status: postStatus,
        pillar: postPillar,
        campaign: postCampaign || "",
        date: postDate,
        time: postTime,
        format: postFormat,
        phase: postPhase,
        tags: postTags,
        visuals: postVisuals
      };

      setPosts(prev => [newPost, ...prev]);

      if (auth.currentUser) {
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid, "posts", newId), newPost);
        } catch (err) {
          console.error(err);
        }
      }
    }
    setIsPostModalOpen(false);
  };

  // Secure Gemini client action from modal
  const handleExecuteAiWriting = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResult("");

    try {
      const isRefining = postContent.trim().length > 0;
      const apiAction = isRefining ? "refine" : "draft";

      const payload = isRefining 
        ? {
            text: postContent,
            channel: postChannel,
            improvement: `${aiImprovement} dans un ton ${aiTone}`
          }
        : {
            channel: postChannel,
            topic: postTitle || "Un sujet technique ou d'actualité business",
            tone: aiTone,
            keywords: "performance, technologie, opportunité"
          };

      const res = await fetch("/api/gemini/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: apiAction,
          payload
        })
      });

      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
      } else if (data.error) {
        setAiError(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Impossible de joindre l'assistant IA. Vérifiez votre configuration de serveur.");
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle channel active boolean
  const handleToggleChannel = async (id: string) => {
    const updated = channels.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setChannels(updated);
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { channels: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Manage curation state
  const handleAddCurationItem = async (item: CurationItem) => {
    setCurationItems(prev => [item, ...prev]);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid, "curation", item.id), item);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteCurationItem = async (id: string) => {
    setCurationItems(prev => prev.filter(c => c.id !== id));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "curation", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateBrandName = async (newName: string) => {
    setBrandName(newName);
    if (user) {
      setUser(prev => prev ? { ...prev, name: newName } : null);
    }
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { brandName: newName });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Render correct nested tab view content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            posts={posts}
            campaigns={campaigns}
            channels={channels}
            userName={user?.name || "Rédacteur"}
            brandTheme={brandTheme}
            brandThemeTags={brandThemeTags}
            onUpdateThemeTags={handleUpdateThemeTags}
            onNavigateToCalendar={() => setActiveTab("calendar")}
            onOpenNewPostModal={handleOpenNewPostModal}
            onSelectPost={handleSelectPost}
          />
        );
      case "calendar":
        return (
          <CalendarView
            posts={posts}
            channels={channels}
            campaigns={campaigns}
            statusConfigs={STATUS_CONFIGS}
            onOpenNewPostModal={handleOpenNewPostModal}
            onSelectPost={handleSelectPost}
          />
        );
      case "veille":
        return (
          <CurationView
            curationItems={curationItems}
            onAddCurationItem={handleAddCurationItem}
            onSendToGazette={handleCurationToPost}
            onDeleteCurationItem={handleDeleteCurationItem}
          />
        );
      case "analytics":
        return (
          <AnalyticsView 
            posts={posts} 
            channels={channels} 
          />
        );
      case "settings":
        return (
          <SettingsView
            channels={channels}
            onToggleChannel={handleToggleChannel}
            brandName={brandName}
            onUpdateBrandName={handleUpdateBrandName}
            posts={posts}
            onClearAllPosts={handleClearAllPosts}
            onLoadDemoPosts={handleLoadDemoPosts}
            onResetTheme={handleResetTheme}
          />
        );
      default:
        return null;
    }
  };

  // Show system loader while authenticating or loading firestore documents
  if (systemLoading) {
    return (
      <div id="gazette-system-loader" className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center font-sans text-[#131211]">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-serif italic text-4xl tracking-tight text-[#131211] animate-pulse">Gazette</h1>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-800" />
            <span>Chargement confidentiel...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login panel if not authenticated
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Show theme onboarding if authenticated but has no brandTheme configured
  if (user && (!brandTheme || showSetup)) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-6 sm:p-12 font-sans text-[#131211]">
        <header id="onboarding-header" className="flex items-center justify-between max-w-4xl mx-auto w-full border-b border-[#E3DEC3]/40 pb-5">
          <div className="flex items-center gap-2">
            <span className="font-serif italic font-black text-2xl tracking-tighter text-[#131211]">
              Gazette <span className="text-[#DD7E5C] font-sans font-extrabold text-[11px] uppercase tracking-widest pl-1 bg-[#DD7E5C]/10 px-2 py-0.5 rounded-sm">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline" id="user-display-email">
              {user?.email}
            </span>
            <button 
              id="onboarding-logout-btn"
              onClick={handleLogout}
              className="text-xs text-red-700 hover:text-red-900 border border-red-200 bg-red-50/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto w-full py-6 flex-1 flex flex-col justify-center">
          <SetupWizardView
            onComplete={(setupData) => {
              handleSetupComplete(setupData);
            }}
          />
        </main>

        <footer id="onboarding-footer" className="max-w-4xl mx-auto w-full border-t border-[#E3DEC3]/40 pt-5 text-center">
          <p className="text-[11px] text-gray-500 font-serif italic font-medium">
            Gazette • Planificateur et secrétaire de rédaction intelligent.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div id="app-workspace-shell" className="flex h-screen w-full overflow-hidden bg-[#FAF8F5]">
      
      {/* Dynamic Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        postsCount={posts.length}
      />

      {/* Main page content area */}
      <main id="app-viewport-wrapper" className="flex-1 flex flex-col h-full overflow-hidden relative">
        {isPostModalOpen ? (
          <PostEditorView
            editingPost={editingPost}
            postTitle={postTitle}
            setPostTitle={setPostTitle}
            postContent={postContent}
            setPostContent={setPostContent}
            postChannel={postChannel}
            setPostChannel={setPostChannel}
            postStatus={postStatus}
            setPostStatus={setPostStatus}
            postPillar={postPillar}
            setPostPillar={setPostPillar}
            postCampaign={postCampaign}
            setPostCampaign={setPostCampaign}
            postDate={postDate}
            setPostDate={setPostDate}
            postTime={postTime}
            setPostTime={setPostTime}
            campaigns={campaigns}
            channels={channels}
            user={user}
            onSave={handleSavePost}
            onDelete={editingPost ? () => handleDeletePost(editingPost.id) : undefined}
            onCancel={() => setIsPostModalOpen(false)}
            handleExecuteAiWriting={async (customTopic, customTone, customImprovement) => {
              setAiLoading(true);
              setAiError("");
              setAiResult("");
              try {
                const toneVal = customTone || aiTone;
                const impVal = customImprovement || aiImprovement;
                const isRefining = (postContent || "").trim().length > 0;
                const apiAction = isRefining ? "refine" : "draft";

                const payload = isRefining 
                  ? {
                      text: postContent,
                      channel: postChannel,
                      improvement: `${impVal} dans un ton ${toneVal}`
                    }
                  : {
                      channel: postChannel,
                      topic: customTopic || postTitle || "Un sujet technique ou d'actualité business",
                      tone: toneVal,
                      keywords: "performance, technologie, opportunité"
                    };

                const res = await fetch("/api/gemini/action", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: apiAction,
                    payload
                  })
                });

                const data = await res.json();
                if (data.result) {
                  setPostContent(data.result);
                  setAiResult(data.result);
                  return data.result;
                } else if (data.error) {
                  setAiError(data.error);
                  return null;
                }
              } catch (err: any) {
                console.error(err);
                setAiError("Impossible de joindre l'assistant IA.");
              } finally {
                setAiLoading(false);
              }
              return null;
            }}
            aiLoading={aiLoading}
            aiError={aiError}
            aiResult={aiResult}
            setAiResult={setAiResult}
            aiTone={aiTone}
            setAiTone={setAiTone}
            aiImprovement={aiImprovement}
            setAiImprovement={setAiImprovement}
          />
        ) : (
          renderTabContent()
        )}
      </main>

    </div>
  );
}
