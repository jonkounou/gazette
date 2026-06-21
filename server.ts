import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK securely on the server wrapper
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not set in environment or Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// REST endpoints for the editor
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// AI Writing & Curation assistant proxy endpoint
app.post("/api/gemini/action", async (req, res) => {
  try {
    const { action, payload } = req.body;
    const client = getGeminiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Clé API non configurée. Veuillez ajouter GEMINI_API_KEY dans vos Secrets AI Studio."
      });
    }

    if (action === "draft") {
      const { channel, topic, tone, keywords, currentOutline } = payload;
      let prompt = `Rédige un brouillon de publication de haute qualité pour le canal ${channel}.\n`;
      prompt += `Sujet principal : ${topic}\n`;
      if (tone) prompt += `Ton de communication : ${tone}\n`;
      if (keywords) prompt += `Mots-clés / thèmes à inclure : ${keywords}\n`;
      if (currentOutline) prompt += `Structure ou points clés : ${currentOutline}\n`;
      prompt += `\nRègles d'écriture :\n`;
      prompt += `- Format adapté au canal (par ex. espacement aéré pour LinkedIn avec quelques emojis, court avec hashtags pour X/Twitter, engageant et visuel pour Instagram...)\n`;
      prompt += `- Doit être rédigé en Français élégant, captivant dès la première ligne.\n`;
      prompt += `- Propose 3 titres chocs ou accroches alternatives au début du message, suivies du corps principal.\n`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Tu es un copywriter professionnel chevronné et rédacteur en chef d'un journal éditorial moderne, spécialiste de la croissance organique sur LinkedIn, Twitter (X), Threads, Instagram et Newsletters. Ton style est incisif, élégant, dégageant une vraie autorité sans faire 'traduit de l'anglais' ni utiliser de formules clichés de l'IA (comme 'À l'ère du numérique...', 'Explorons...', 'De nos jours...')."
        }
      });

      return res.json({ result: response.text });

    } else if (action === "refine") {
      const { text, channel, improvement } = payload;
      let prompt = `Ajuste et optimise le document de publication suivant pour le réseau "${channel}" :\n\n`;
      prompt += `--- DEBUT TEXTE ---\n${text}\n--- FIN TEXTE ---\n\n`;
      prompt += `Instruction de retouche : ${improvement}\n`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Tu es un secrétaire de rédaction et correcteur professionnel. Tu améliores la fluidité, le rythme, la grammaire et l'impact d'un texte tout en respectant scrupuleusement l'intention originelle de l'auteur."
        }
      });

      return res.json({ result: response.text });

    } else if (action === "suggestRefinements") {
      const { theme } = payload;
      const client = getGeminiClient();

      const prompt = `L'utilisateur s'intéresse au thème principal suivant : "${theme}".
Suggère des pistes précises pour structurer sa ligne éditoriale et affiner son projet.
Génère une réponse sous forme de JSON strict avec le schéma suivant :
{
  "suggestedSubTopics": ["Option 1 sous-sujet précis", "Option 2 sous-sujet précis", "Option 3 sous-sujet précis"],
  "suggestedAudiences": ["Option d'audience 1", "Option d'audience 2", "Option d'audience 3"],
  "suggestedTones": ["Ton 1 (ex: Humoristique et piquant)", "Ton 2 (ex: Expert et technique)", "Ton 3 (ex: Didactique et bienveillant)"],
  "keywords": "MotClef1, MotClef2, MotClef3, MotClef4"
}

Remarques : rédigé en Français. Sois créatif, moderne et évite les banalités absolues. Renvoie uniquement le JSON brut. Pas de bloc de code markdown.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Tu es un consultant en stratégie de contenu éditorial professionnel. Tu structures des lignes directrices captivantes."
        }
      });

      try {
        const cleaned = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        return res.json(JSON.parse(cleaned));
      } catch (err) {
        console.error("Failed to parse refinements JSON:", response.text);
        return res.status(500).json({ error: "Erreur de format de suggestions" });
      }

    } else if (action === "generateOnboardingData") {
      const { theme, audience, tone, format, details } = payload;
      const client = getGeminiClient();

      const prompt = `Génère un lot complet de contenu de démarrage personnalisé pour un créateur travaillant sur le thème principal : "${theme}".
Les détails d'affinement facultatifs sont :
- Audience cible : ${audience || "Générale"}
- Ton de communication : ${tone || "Professionnel & Inspirant"}
- Format privilégié : ${format || "Mixte"}
- Informations additionnelles : ${details || "Aucune"}

Tu dois générer exactement :
1. Un tableau de 4 publications (posts) réalistes et prêtes à être planifiées ou publiées sur différents réseaux. Répartis-les sur des dates à partir du "2026-06-21" (Dimanche 21 juin 2026 correspond à aujourd'hui dans l'application, alterne entre le 2026-06-21, 22, 23 et 24).
Utilise différents canaux (linkedin: 2, twitter: 1, newsletter ou blog: 1).
Le statut ("status") de chaque post doit être "idea" ou "draft".
2. Un tableau de 4 articles curatoriaux fictifs ou réels de veille informationnelle ("curation") extrêmement pertinents par rapport à ce thème.

Format attends de retour (JSON Strict uniquement, sans codeblocks markdown, sans commentaires) :
{
  "posts": [
    {
      "title": "Titre ou sujet court",
      "content": "Contenu complet rédigé avec brio (saute des lignes pour LinkedIn, ajoute des emojis si pertinent)",
      "channel": "linkedin" ou "twitter" ou "newsletter" ou "blog",
      "status": "draft" ou "idea",
      "pillar": "Education" ou "Annonce" ou "Blog / Valeur" ou "B2B" ou "Formation",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "format": "Post simple" ou "Carrousel" ou "Thread",
      "phase": "Evergreen" ou "Tendance",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "curation": [
    {
      "title": "Titre accrocheur de l'article de veille",
      "summary": "Résumé de 2-3 phrases sur la tendance ou la nouveauté liée au thème d'onboarding",
      "source": "@expert_pseudo ou Média spécialisé",
      "importance": 0.65 à 0.98,
      "tweetsCount": 15 à 450,
      "category": "USE-CASE" ou "RELEASE" ou "DEBATE" ou "TUTORIAL",
      "daysAgo": "il y a 1 jour" ou "il y a 3 jours"
    }
  ]
}

Assure-toi que les textes soient d'une qualité rédactionnelle irréprochable et entièrement en Français. Renvoie uniquement le JSON brut.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Tu es un chef de projet éditorial et un copywriter d'élite. Tu produis des listes de posts et de curation de contenu calibrées pour captiver l'audience spécifiée."
        }
      });

      try {
        const cleaned = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        return res.json(JSON.parse(cleaned));
      } catch (err) {
        console.error("Failed to parse onboarding JSON:", response.text);
        return res.status(500).json({ error: "Erreur de format du jeu de démarrage" });
      }

    } else if (action === "veille") {
      // Simulate/Generate high-quality curation items matching the selected topic
      const { topic, amount = 6 } = payload;
      
      const prompt = `Génère une liste de ${amount} articles d'actualité ou récits de tendances capturants et ultra-réalistes en rapport avec le thème : "${topic}".
Chaque élément doit ressembler à un vrai contenu qui fait le buzz sur Twitter (X), LinkedIn ou les blogs d'influenceurs techniques.

Instructions de retour :
Renvoie uniquement un tableau JSON valide. Ne mets aucun texte d'introduction ni de conclusion, n'utilise pas de blocs de code markdown (pas de \`\`\`json ... \`\`\`), renvoie un JSON brut.

Chaque élément de la liste doit présenter ce format :
{
  "title": "Titre percutant et professionnel",
  "summary": "Résumé de 2-3 phrases décrivant le fond de l'histoire, la tendance ou la polémique récente",
  "source": "@pseudo_expert ou Nom de média",
  "importance": 0.55 à 0.98 (un nombre décimal)",
  "tweetsCount": nombre de partages ou tweets bruts simulé (par exemple entre 12 et 500)",
  "category": "USE-CASE" ou "RELEASE" ou "DEBATE" ou "TUTORIAL",
  "daysAgo": nombre de jours écoulés sous forme de texte (ex: "il y a 2 jours", "il y a 11 jours")
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Tu es un curateur d'information très pointu. Tu alimentes un flux de veille qualifiée pour des professionnels du marketing et de la création de contenu."
        }
      });

      const text = response.text || "[]";
      try {
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const items = JSON.parse(cleaned);
        return res.json({ items });
      } catch (err) {
        console.error("Failed to parse generated JSON:", text);
        return res.status(500).json({ error: "Format de réponse généré incorrect. Veuillez réessayer." });
      }

    } else if (action === "setup_theme") {
      const { theme } = payload;
      const prompt = `L'utilisateur a configuré sa plateforme de planification d'articles avec le thème principal : "${theme}".
Tu dois générer un contenu très réaliste adapté à ce thème.
La réponse doit être un objet JSON valide avec cette structure brute :
{
  "brandName": "Nom de marque créatif et unique (ex: No-Code Horizon, TechPulse, etc.)",
  "slogan": "Un slogan créatif court et inspirant qui résume cette thématique",
  "posts": [
    {
      "title": "Idée de publication 1 (par ex. Éducation ou Astuce)",
      "content": "Corps de la publication rédigé de façon percutante et professionnelle (environ 100-150 mots, mise en page aérée)",
      "channel": "linkedin",
      "pillar": "Education",
      "status": "idea",
      "phase": "Evergreen",
      "tags": ["astuce", "tutoriel"]
    },
    {
      "title": "Idée de publication 2 (par ex. Tendance ou Événement)",
      "content": "Autre publication bien formatée selon ce thème, captivante dès la première ligne",
      "channel": "twitter",
      "pillar": "Formation",
      "status": "draft",
      "phase": "Tendance",
      "tags": ["news", "veille"]
    }
  ]
}

Règles :
- Renvoie uniquement cet objet JSON valide. Ne mets aucun texte d'introduction ni de conclusion, n'utilise pas de blocs de code markdown (pas de \`\`\`json ... \`\`\`), renvoie un JSON brut.
- Tout doit être rédigé en français impeccable, adapté au thème renseigné.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Tu es un consultant en stratégie digitale et concepteur-rédacteur haut de gamme d'un média ou d'un cabinet renommé."
        }
      });

      const text = response.text || "{}";
      try {
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleaned);
        return res.json(data);
      } catch (err) {
        console.error("Failed to parse setup_theme JSON:", text);
        return res.status(500).json({ error: "Impossible de générer le profil thématique. Veuillez réessayer." });
      }

    } else {
      return res.status(400).json({ error: "Action inconnue." });
    }
  } catch (err: any) {
    console.error("Gemini Assistant error:", err);
    res.status(500).json({ error: err?.message || "Erreur interne de l'assistant IA." });
  }
});

// Setup Vite middleware or static serving
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Gazette server is running on http://localhost:${PORT}`);
  });
}

configureApp();
