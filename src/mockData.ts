import { Post, CurationItem, Campaign, ChannelConfig, PostStatusConfig } from "./types";

export const INITIAL_CHANNELS: ChannelConfig[] = [
  { id: "linkedin", name: "LinkedIn", active: true, color: "#0077B5", iconName: "Linkedin" },
  { id: "twitter", name: "X (Twitter)", active: true, color: "#0F1419", iconName: "Twitter" },
  { id: "instagram", name: "Instagram", active: true, color: "#E1306C", iconName: "Instagram" },
  { id: "tiktok", name: "TikTok", active: true, color: "#25F4EE", iconName: "Video" },
  { id: "facebook", name: "Facebook", active: false, color: "#1877F2", iconName: "Facebook" },
  { id: "newsletter", name: "Newsletter", active: true, color: "#12B76A", iconName: "Mail" },
  { id: "blog", name: "Blog", active: true, color: "#7F56D9", iconName: "BookOpen" }
];

export const STATUS_CONFIGS: PostStatusConfig[] = [
  { id: "idea", label: "Idée", color: "#667085", bgClass: "bg-gray-100 text-gray-700" },
  { id: "draft", label: "Brouillon", color: "#344054", bgClass: "bg-slate-200 text-slate-800" },
  { id: "review", label: "En review", color: "#B54708", bgClass: "bg-amber-100 text-amber-800" },
  { id: "scheduled", label: "Planifié", color: "#175CD3", bgClass: "bg-blue-100 text-blue-800" },
  { id: "published", label: "Publié", color: "#027A48", bgClass: "bg-emerald-100 text-emerald-800" }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "cohort3",
    name: "Lancement Cohorte 3",
    description: "Campagne de communication autour de l'ouverture de la Cohorte 3 de formation IA et Automatisation.",
    startDate: "2026-06-01",
    endDate: "2026-06-25"
  },
  {
    id: "summer",
    name: "Campagne IA d'Été",
    description: "Série d'articles de veille technologique et tutoriels pratiques pour rester à jour pendant les vacances.",
    startDate: "2026-07-01",
    endDate: "2026-08-15"
  }
];

export const INITIAL_POSTS: Post[] = [
  // June 1 (Monday)
  { id: "post-1", title: "Peppermint, le game changer.", content: "Découvrez notre analyse complète sur Peppermint, la nouvelle pépite de l'automatisation en entreprise.", channel: "linkedin", status: "published", pillar: "Blog / Valeur", date: "2026-06-01", time: "09:00", campaign: "cohort3" },
  { id: "post-2", title: "Meme 1", content: "Quand ton script d'automatisation fonctionne du premier coup.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-01", time: "11:00" },
  { id: "post-3", title: "Bonjour Juin", content: "Un mois chargé en nouveautés et lancements passionnants !", channel: "instagram", status: "published", pillar: "Annonce", date: "2026-06-01", time: "08:30" },

  // June 2 (Tuesday)
  { id: "post-4", title: "J-14 Cohorte 3", content: "Plus que deux semaines pour rejoindre les meilleurs créateurs de flux.", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-02", time: "09:00", campaign: "cohort3" },
  { id: "post-5", title: "Meme 2", content: "Les réunions inutiles vs. un bon prompt bien huilé.", channel: "twitter", status: "published", pillar: "Formation", date: "2026-06-02", time: "14:00" },
  { id: "post-6", title: "Grok Imagine Video 1.5 Preview", content: "Révolution ou simple évolution ? Notre verdict technique sur l'outil de génération vidéo.", channel: "blog", status: "published", pillar: "Education", date: "2026-06-02", time: "16:00" },

  // June 3 (Wednesday)
  { id: "post-7", title: "Meme 3", content: "La vitesse d'évolution des IA est terrifiante.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-03", time: "10:30" },
  { id: "post-8", title: "Benchmark meilleurs IA", content: "Comparatif objectif des modèles de raisonnement avancés.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-03", time: "09:00" },
  { id: "post-9", title: "Early Bird --- Dimance", content: "Alerte : les tarifs préférentiels se terminent ce dimanche soir !", channel: "newsletter", status: "published", pillar: "Formation", date: "2026-06-03", time: "18:00", campaign: "cohort3" },

  // June 4 (Thursday)
  { id: "post-10", title: "Meme 4", content: "L'ordinateur de l'expert en prompts vs celui du commun des mortels.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-04", time: "11:00" },
  { id: "post-11", title: "Dynamic Workflows", content: "Comment adapter dynamiquement ses automatisations selon les retours d'API.", channel: "blog", status: "published", pillar: "Education", date: "2026-06-04", time: "14:30" },
  { id: "post-12", title: "Information sur le webinaire Cohorte 3", content: "Demain à 12h, nous décryptons tout le programme en direct.", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-04", time: "09:15", campaign: "cohort3" },

  // June 5 (Friday)
  { id: "post-13", title: "Meme 5", content: "Attendre que l'API de OpenAI réponde un vendredi soir.", channel: "twitter", status: "published", pillar: "Formation", date: "2026-06-05", time: "10:00" },
  { id: "post-14", title: "Early Bird 2 --- 48h", content: "Le compte à rebours est lancé. Ne ratez pas cette opportunité unique.", channel: "newsletter", status: "published", pillar: "Formation", date: "2026-06-05", time: "17:00", campaign: "cohort3" },
  { id: "post-15", title: "Bytedance frappe encore avec un nouvel outil open-source.", content: "Analyse technique de l'annonce surprise du géant asiatique.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-05", time: "08:45" },

  // June 8 (Monday)
  { id: "post-16", title: "Webinaire JJ-0", content: "Rendez-vous dans 1 heure ! Le lien zoom est dans le mail reçu à l'instant.", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-08", time: "11:00", campaign: "cohort3" },
  { id: "post-17", title: "Comment Anthropic sécurise Claude", content: "Les mystères des barrières de sécurité de Claude 3.1 décortiqués étape par étape.", channel: "blog", status: "published", pillar: "Education", date: "2026-06-08", time: "09:00" },
  { id: "post-18", title: "Mise à jour Claude Code : plus de stabilité pour vos projets", content: "Le client CLI s'améliore significativement sur la gestion de projet.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-08", time: "15:30" },

  // June 9 (Tuesday)
  { id: "post-19", title: "J-6", content: "Le train de l'IA n'attend personne. Rejoignez l'aventure activement.", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-09", time: "09:00", campaign: "cohort3" },
  { id: "post-20", title: "5 tâches quotidiennes à déléguer IMMÉDIATEMENT à l'IA.", content: "Un guide pragmatique pour récupérer 2 heures par jour de temps libre.", channel: "newsletter", status: "published", pillar: "Formation", date: "2026-06-09", time: "08:00" },
  { id: "post-21", title: "Mise à jour SDK Anthropic : stabilité accrue", content: "Prise en charge native des nouveaux schémas de validation.", channel: "twitter", status: "published", pillar: "Education", date: "2026-06-09", time: "16:15" },

  // June 10 (Wednesday)
  { id: "post-22", title: "4 meilleurs prompts de productivité", content: "Enregistrez ce post pour votre prochaine session de travail intense.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-10", time: "09:00" },
  { id: "post-23", title: "Mise à jour Claude Code : plus de stabilité", content: "Un grand pas en avant sur la persistance de l'état.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-10", time: "14:00" },

  // June 11 (Thursday)
  { id: "post-24", title: "Citation percutante", content: "« L'automatisation n'est pas le remplacement du cerveau humain, c'est sa libération. »", channel: "twitter", status: "published", pillar: "Formation", date: "2026-06-11", time: "09:00" },
  { id: "post-25", title: "Story Insta", content: "Coulisses de la préparation de la v3.", channel: "instagram", status: "published", pillar: "Annonce", date: "2026-06-11", time: "12:00", campaign: "cohort3" },
  { id: "post-26", title: "Mise à jour Claude Code 2.1.169", content: "Résolution des conflits d'import de types complexes en TS.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-11", time: "08:15" },
  { id: "post-26b", title: "Mise à jour SDK Anthropic : une sécurité renforcée", content: "Nouveaux contrôles de signature d'API et clés rotation éphémère.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-11", time: "15:00" },
  { id: "post-26c", title: "Mise à jour majeure pour vos Agents Claude", content: "Meilleure prise en charge des protocoles d'exécution hybrides.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-11", time: "10:30" },
  { id: "post-26d", title: "Mise à jour Claude : Fin des erreurs de réponse", content: "Nouveau parseur JSON d'instructions.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-11", time: "14:10" },
  { id: "post-26e", title: "Mise à jour SDK Anthropic : Plus de stabilité pour vos agents", content: "Correction des plantages intermittents sur les longs dialogues.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-11", time: "16:45" },

  // June 12 (Friday)
  { id: "post-27", title: "JJ - 3", content: "Bientôt la clôture définitive des inscriptions. Ne tardez plus.", channel: "linkedin", status: "published", pillar: "Formation", date: "2026-06-12", time: "09:00", campaign: "cohort3" },
  { id: "post-28", title: "Mise à jour majeure pour vos agents Claude", content: "Déploiement des nouveaux modèles de vision avancée de nuit.", channel: "twitter", status: "published", pillar: "Education", date: "2026-06-12", time: "11:30" },
  { id: "post-29", title: "Mise à jour Claude Code : vers des agents plus autonomes", content: "Exécution automatique sécurisée de scripts d'installation fiables.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-12", time: "14:00" },

  // June 15 (Monday)
  { id: "post-30", title: "Cohort 3 officiellement ouvert", content: "Bienvenue à tous nos nouveaux étudiants ! C'est parti pour 6 semaines d'accélération intensive !", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-15", time: "09:00", campaign: "cohort3" },
  { id: "post-31", title: "Claude arrive dans les industries régulées", content: "Découvrez comment Anthropic décroche les certifications majeures HIPAA et SOC 2.", channel: "blog", status: "published", pillar: "B2B", date: "2026-06-15", time: "10:30" },
  { id: "post-32", title: "Mise à jour Claude Code : plus de simplicité pour vos agents", content: "Une réduction massive de la lourdeur des commandes communes.", channel: "twitter", status: "published", pillar: "Education", date: "2026-06-15", time: "16:00" },

  // June 16 (Tuesday)
  { id: "post-33", title: "Claude devient chimiste : une avancée majeure", content: "Modélisation de molécules complexes via les instructions structurées.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-16", time: "09:00" },

  // June 17 (Wednesday)
  { id: "post-34", title: "Mise à jour SDK Anthropic : le ménage est fait", content: "Dépréciation des anciens endpoints XML au profit de JSON standard.", channel: "twitter", status: "published", pillar: "Education", date: "2026-06-17", time: "09:30" },
  { id: "post-35", title: "Nettoyage technique chez Anthropic", content: "Simplification drastique de leur codebase interne et gain de performances mesurables.", channel: "blog", status: "published", pillar: "B2B", date: "2026-06-17", time: "14:00" },
  { id: "post-36", title: "Mise à jour Claude : ce qui change", content: "Un point rapide de 2 minutes en vidéo sur les récents ajouts fonctionnels.", channel: "linkedin", status: "published", pillar: "Annonce", date: "2026-06-17", time: "11:00" },

  // June 18 (Thursday)
  { id: "post-37", title: "Mise à jour claude-code : plus de stabilité pour vos agents", content: "Prise en charge robuste des environnements d'exécution restreints.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-18", time: "09:00" },
  { id: "post-38", title: "Amélioration technique pour Claude Code", content: "Optimisation de la bande passante lors du téléchargement de dépendances.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-18", time: "15:00" },

  // June 19 (Friday)
  { id: "post-39", title: "Concevoir des objets 3D par le texte", content: "Nouveaux pipelines liant vision LLM et modeleurs de pièces finies.", channel: "linkedin", status: "published", pillar: "Education", date: "2026-06-19", time: "09:00" },
  { id: "post-40", title: "Expansion d'Anthropic en Corée", content: "Nouveau bureau à Séoul pour accélérer la croissance en Asie-Pacifique.", channel: "twitter", status: "published", pillar: "B2B", date: "2026-06-19", time: "11:00" },
  { id: "post-41", title: "Mise à jour majeure pour Claude Code", content: "Arrivée de l'audit de sécurité automatique et de la correction de vulnérabilités.", channel: "blog", status: "published", pillar: "Education", date: "2026-06-19", time: "14:30" },

  // --- Active / Scheduled or drafts for current week (June 21 - June 26) ---
  { id: "post-42", title: "Mise à jour sécurisée pour Claude Code", content: "Focus sur la conformité de l'isolation du code dans les bacs à sable d'exploration locale.", channel: "linkedin", status: "scheduled", pillar: "Education", date: "2026-06-22", time: "09:00" },
  { id: "post-43", title: "Mise à jour majeure pour Claude Code", content: "Introduction du versioning automatique de vos solutions logicielles.", channel: "linkedin", status: "scheduled", pillar: "Education", date: "2026-06-22", time: "14:00" },
  { id: "post-44", title: "Amélioration des réponses avec l'API Claude", content: "Comment implémenter un pipeline de validation d'assertion unitaire.", channel: "twitter", status: "scheduled", pillar: "Education", date: "2026-06-22", time: "11:00" },

  // Some drafts and ideas
  { id: "post-45", title: "Guide de l'automatisation sans code", content: "Brouillon de l'article sur n8n, Make et l'IA générative.", channel: "linkedin", status: "draft", pillar: "Blog / Valeur", date: "2026-06-23", time: "10:00" },
  { id: "post-46", title: "Pourquoi l'IA ne va pas vous remplacer (mais quelqu'un qui l'utilise oui)", content: "Réflexion philosophique sur les rôles de demain.", channel: "linkedin", status: "idea", pillar: "Blog / Valeur", date: "2026-06-25", time: "09:00" }
];

export const INITIAL_CURATION: CurationItem[] = [
  {
    id: "cur-1",
    title: "Adoption massive des agents autonomes dans les workflows métier",
    summary: "Les agents IA sortent du cadre du code pour optimiser des fonctions métiers complexes : marketing chez Salesforce, juridique chez Wordsmith, et comptabilité chez Digits. Ces solutions permettent une automatisation déterministe avec une supervision humaine légère.",
    source: "@XNewsGlobalEn",
    importance: 0.70,
    tweetsCount: 191,
    category: "USE-CASE",
    daysAgo: "il y a 11 jours"
  },
  {
    id: "cur-2",
    title: "Lancement du modèle Fable 5 par Anthropic : performances et enjeux de sécurité",
    summary: "Anthropic introduit Fable 5, un modèle aux capacités de raisonnement avancé et de codage supérieures, intégrant une sécurité renforcée qui redirige certaines requêtes sensibles vers le modèle Opus 4.8. Les retours soulignent une précision de 98% sur les tests de calcul logique.",
    source: "@claudeai",
    importance: 0.90,
    tweetsCount: 64,
    category: "RELEASE",
    daysAgo: "il y a 11 jours"
  },
  {
    id: "cur-3",
    title: "Comment orchestrer 10 agents IA locaux avec Ollama et LlamaIndex",
    summary: "Un guide pas-à-pas pour monter une cellule de recherche autonome fonctionnant entièrement sur votre propre carte graphique. Le déploiement requiert moins de 16 Go de VRAM grâce aux quantifications GGUF modernes.",
    source: "@TheAIHacker",
    importance: 0.65,
    tweetsCount: 345,
    category: "TUTORIAL",
    daysAgo: "il y a 3 jours"
  },
  {
    id: "cur-4",
    title: "Le libre vs le propriétaire : la guerre des prix s'accélère sur les jetons",
    summary: "Les récentes baisses de tarifs de 70% chez les hébergeurs de LLM ouverts forcent les géants de la tech à réduire drastiquement leurs marges de distribution d'API. Est-ce un modèle économique viable à long terme ?",
    source: "@SaaSDaily",
    importance: 0.81,
    tweetsCount: 202,
    category: "DEBATE",
    daysAgo: "il y a 5 jours"
  }
];
