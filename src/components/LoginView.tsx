import React, { useState } from "react";
import { User } from "../types";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Loader2, AlertCircle } from "lucide-react";

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      onLogin({
        email: credential.user.email || "",
        name: credential.user.displayName || "Rédacteur en chef",
        role: "Rédacteur en chef",
        avatarUrl: credential.user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        isNewUser: false
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-blocked") {
        setErrorMsg("Le popup de connexion a été bloqué par votre navigateur. Veuillez autoriser les fenêtres pop-up.");
      } else {
        setErrorMsg("Connexion Google impossible: " + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error("Veuillez saisir votre nom d'utilisateur ou de marque.");
        }
        // Create user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        // We can update the profile displayName with the brand name!
        await updateProfile(credential.user, {
          displayName: name
        });
        
        onLogin({
          email: email,
          name: name,
          role: "Rédacteur en chef",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          isNewUser: true
        });
      } else {
        // Sign in user
        const credential = await signInWithEmailAndPassword(auth, email, password);
        
        onLogin({
          email: credential.user.email || email,
          name: credential.user.displayName || "Rédacteur",
          role: "Rédacteur en chef",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          isNewUser: false
        });
      }
    } catch (err: any) {
      console.error(err);
      let frenchError = err.message || "Une erreur est survenue lors de l'authentification.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        frenchError = "E-mail ou mot de passe incorrect.";
      } else if (err.code === "auth/email-already-in-use") {
        frenchError = "Cet e-mail est déjà utilisé par un autre compte.";
      } else if (err.code === "auth/weak-password") {
        frenchError = "Le mot de passe doit contenir au moins 6 caractères.";
      } else if (err.code === "auth/invalid-email") {
        frenchError = "Adresse e-mail invalide.";
      } else if (err.code === "auth/operation-not-allowed") {
        frenchError = "La création de compte par e-mail/mot de passe n'est pas encore activée dans la console Firebase. Vous pouvez : 1) Vous connecter directement via Google (recommandé), 2) Activer le fournisseur d'accès 'E-mail/Mot de passe' dans votre console Firebase, ou 3) Cliquer sur 'Espace Démo'.";
      }
      setErrorMsg(frenchError);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBypass = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const demoEmail = "demo@gazette.ai";
      const demoPw = "demoPassword123";
      try {
        const credential = await signInWithEmailAndPassword(auth, demoEmail, demoPw);
        onLogin({
          email: demoEmail,
          name: credential.user.displayName || "Espace Démo",
          role: "Rédacteur en chef",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          isNewUser: false
        });
      } catch (innerErr: any) {
        if (innerErr.code === "auth/user-not-found" || innerErr.code === "auth/invalid-credential" || innerErr.code === "auth/wrong-password") {
          // Try to create it under the hood
          const credential = await createUserWithEmailAndPassword(auth, demoEmail, demoPw);
          await updateProfile(credential.user, {
            displayName: "Espace Démo"
          });
          onLogin({
            email: demoEmail,
            name: "Espace Démo",
            role: "Rédacteur en chef",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
            isNewUser: true // So it kicks off onboarding/mock generation
          });
        } else {
          throw innerErr;
        }
      }
    } catch (err) {
      console.warn("Connexion Firebase E-mail/Mot de passe non disponible. Connexion Démo locale activée.", err);
      // Fallback safely to offline/local mode so user is NEVER blocked
      onLogin({
        email: "demo@gazette.ai",
        name: "Espace Démo (Local)",
        role: "Rédacteur en chef",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        isNewUser: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-layout" className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF8F5]">
      {/* Editorial Left Side - Dark & Poetic */}
      <div 
        id="login-editorial-panel" 
        className="w-full md:w-[45%] bg-[#131211] text-[#FAF8F5] p-8 md:p-16 flex flex-col justify-between"
      >
        <div id="logo-header">
          <h1 className="font-serif italic text-3xl md:text-4xl tracking-tight font-light">Gazette</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#FAF8F5]/60 mt-1 font-mono font-medium">
            Planificateur Éditorial
          </p>
        </div>

        <div id="editorial-quote-container" className="my-16 md:my-0 max-w-md">
          <blockquote className="font-serif italic text-2xl md:text-4xl leading-relaxed text-[#ECE9E0]">
            « La salle de rédaction, ordonnée comme un journal du matin. »
          </blockquote>
          <p className="text-sm md:text-base text-[#FAF8F5]/70 mt-6 leading-relaxed bg-[#131211]">
            Centralisez vos publications LinkedIn, X, Instagram, TikTok, Newsletter et Blog. 
            Calendrier, statuts, piliers, campagnes — tout au même endroit.
          </p>
        </div>

        <div id="login-footer" className="text-xs text-[#FAF8F5]/40 font-mono tracking-widest uppercase">
          Édition 2026
        </div>
      </div>

      {/* Connection Right Side - Soft Warm Cream Form */}
      <div 
        id="login-form-panel" 
        className="w-full md:w-[55%] flex flex-col justify-center items-center px-6 py-12 md:p-24"
      >
        <div id="login-form-card" className="w-full max-w-sm">
          <h2 className="font-serif italic text-4xl md:text-5xl text-[#131211] tracking-tight mb-2">
            {isSignUp ? "Créer un compte." : "Bon retour."}
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-8">
            {isSignUp 
              ? "Commencez à structurer votre planning éditorial." 
              : "Reprenez votre planning là où vous l'avez laissé."}
          </p>

          {/* Google Connection button (always active) */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-md shadow-xs transition-colors cursor-pointer text-sm mb-6"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6-4.53z"
              />
            </svg>
            <span>Se connecter avec Google</span>
          </button>

          <div id="login-or-divider-top" className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-[#FAF8F5] px-3 font-mono text-[9px] text-gray-400 uppercase tracking-widest whitespace-nowrap">
              OU AVEC VOS IDENTIFIANTS
            </span>
          </div>

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div id="form-group-name" className="flex flex-col border-b border-gray-200 py-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Nom d'utilisateur / Marque
                </label>
                <input
                  id="signup-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none text-[#131211] placeholder-gray-300 focus:outline-none focus:ring-0 text-base py-1"
                  placeholder="ex: AprenX"
                  disabled={loading}
                />
              </div>
            )}

            <div id="form-group-email" className="flex flex-col border-b border-gray-200 py-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                E-mail
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-[#131211] placeholder-gray-300 focus:outline-none focus:ring-0 text-base py-1"
                placeholder="vous@exemple.com"
                disabled={loading}
              />
            </div>

            <div id="form-group-password" className="flex flex-col border-b border-gray-200 py-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Mot de passe
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none text-[#131211] placeholder-gray-300 focus:outline-none focus:ring-0 text-base py-1 font-mono text-xs"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {errorMsg && (
              <div id="login-error-alert" className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-150">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#131211] hover:bg-black text-[#FAF8F5] transition-colors py-3.5 px-4 rounded-md font-medium text-sm mt-4 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-[#131211] flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSignUp ? "Créer un compte" : "Se connecter"}</span>
            </button>
          </form>

          {/* Quick connection help */}
          <div id="login-or-divider" className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-[#FAF8F5] px-3 font-mono text-[9px] text-gray-400 uppercase tracking-widest">
              OU
            </span>
          </div>

          <button
            id="quick-demo-bypass-btn"
            type="button"
            onClick={handleQuickBypass}
            disabled={loading}
            className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-medium py-3 rounded-md text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>⚡ Accéder directement à l'espace Démo</span>
          </button>

          <p id="toggle-auth-mode-text" className="text-center mt-8 text-xs text-gray-500">
            {isSignUp ? "Déjà membre ? " : "Pas encore de compte ? "}
            <button
              id="toggle-auth-mode-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
              }}
              disabled={loading}
              className="text-amber-800 hover:text-amber-950 font-medium underline inline-block"
            >
              {isSignUp ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
