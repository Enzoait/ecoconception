Ton objectif est de faire en sorte que ce projet réponde aux bonnes pratiques d'écoconception. 

Pour ce faire tu dois prendre compte du contexte suivant : 

L'écoconception consiste à réduire l'impact environnemental d'un produit ou d'un service sur l'intégralité de son cycle de vie (de la conception à la fin de vie).

Les 5 Piliers de la démarche
- Frugalité : Délivrer le bon service, au bon moment, sans fonctionnalités superflues ("Less is more").
- Efficience architecturale & algorithmique : Optimiser chaque ligne de code et chaque requête pour réduire l'usage CPU/RAM.
- Performance utilisateur & énergétique : Garantir une expérience fluide qui consomme le moins de batterie possible sur le terminal client.
- Longévité & Maintenabilité : Produire un code durable et modulaire pour limiter les refontes coûteuses et l'obsolescence logicielle.
- Accessibilité : Un service éco-conçu doit être utilisable par tous, sur n'importe quel terminal, même ancien ou avec une connexion limitée.

Réglementation et Référentiels
Le cadre légal s'est durci pour encourager les entreprises à adopter des pratiques plus sobres.

La Loi REEN (France)
La loi visant à Réduire l'Empreinte Environnementale du Numérique impose :

La lutte contre l'obsolescence logicielle.
L'obligation pour les collectivités de définir une stratégie numérique responsable.
La sensibilisation dès la formation initiale des ingénieurs et développeurs.
Les Référentiels Clés
RGESN (Référentiel Général d'Écoconception de Services Numériques) : Le standard officiel en France, structuré autour de 78 critères de conformité.
GR491 : Le Guide de Référence de Conception Responsable de Services Numériques, piloté par l'ISIT.
L'IA et son impact environnemental en 2026
L'explosion de l'IA générative a radicalement modifié les trajectoires de consommation.

Consommation mondiale : La demande énergétique des datacenters (portée par l'IA) devrait atteindre 1 050 TWh en 2026, soit le double de 2022.
Le coût d'une requête : Une interaction avec un LLM (type GPT-4) consomme environ 2 Wh, soit 6 à 10 fois plus qu'une recherche classique.
Impact hydrique : On estime qu'une session de 20 à 50 questions consomme environ 500 ml d'eau douce pour le refroidissement des serveurs.
Outils d'Analyse et de Mesure
Pour piloter l'optimisation, nous utilisons trois types d'outils :

Performance & Impact Direct
Lighthouse (Chrome) : Mesure la performance (Core Web Vitals), l'accessibilité et le SEO.
DevTools : Pour l'inspection avancée du réseau, du rendu et de la mémoire.
Évaluation Écoconception
EcoIndex.fr : Fournit un score de A à G basé sur le poids de la page, la complexité du DOM et le nombre de requêtes.
GreenFrame : Pour estimer les émissions de CO2 d'un parcours utilisateur complet.
Profiling et Monitoring
Sentry : Pour le suivi des erreurs et de la performance en production.
Pyroscope : Pour le profiling continu et le monitoring de l'utilisation du CPU ainsi que de la mémoire dans votre base de code.

Les Métriques de Performance
Pour mesurer et optimiser la performance perçue, on s'appuie sur des métriques standardisées, souvent appelées Web Vitals.

Core Web Vitals
Ces métriques sont essentielles car elles sont prises en compte par Google pour le référencement (SEO) et reflètent directement l'expérience utilisateur.

LCP (Largest Contentful Paint)
Le moment où l'élément le plus visible dans la fenêtre (viewport) est entièrement affiché. C'est souvent l'image principale (hero image) ou le bloc de texte principal.

Objectif : < 2.5 secondes.
INP (Interaction to Next Paint)
Mesure la réactivité de la page.

INP : Mesure la latence de réponse globale de la page (moyenne du temps de réponse pour toutes les interactions). Il remplace le FID et donne une vision plus complète de la réactivité.
CLS (Cumulative Layout Shift)
Mesure la stabilité visuelle de la page. Il quantifie la fréquence et l'ampleur des changements de mise en page inattendus (ex: un bouton qui bouge au dernier moment).

Importance : Évite les clics accidentels et la frustration utilisateur.
Autres métriques
Ces métriques sont souvent utilisées dans les outils comme Lighthouse pour diagnostiquer les problèmes.

FCP (First Contentful Paint)
Le moment où le navigateur affiche le premier élément de contenu du DOM (texte, image, etc.). C'est la première confirmation visuelle pour l'utilisateur que "ça charge".

FCP
TBT (Total Blocking Time)
Mesure le temps total pendant lequel le thread principal est bloqué (tâches > 50ms) entre le FCP et le TTI. C'est un excellent proxy pour optimiser l'INP.

Loading Sequence
Optimiser la Loading Sequence (séquence de chargement) est crucial pour garantir une expérience utilisateur fluide et réduire l'impact énergétique des devices utilisateurs.

Pourquoi c'est compliqué ?
Souvent, il existe un écart entre ce que nous pensons prioriser et ce que le navigateur fait réellement.

Problèmes courants
Séquençage sous-optimal : Les ressources nécessaires au FCP ou LCP sont bloquées par des scripts non critiques.
Utilisation inefficace du Réseau/CPU : Téléchargement de scripts volumineux qui saturent la bande passante ou le thread principal au mauvais moment.
Scripts Tiers (3rd Party) : Analytics, publicités, widgets sociaux qui s'insèrent de manière désordonnée et bloquent le rendu.
La Loading Sequence Idéale
L'objectif est d'ordonner le chargement pour satisfaire les métriques dans l'ordre logique : FCP → LCP → Interactivité.

Séquence Recommandée
Ressources Critiques (FCP) :

HTML initial.
Critical CSS (idéalement inliné ou via preload).
Le Critical CSS est la partie minimale du CSS nécessaire pour afficher le début de la page (Above the Fold). Tout le reste peut être chargé plus tard pour ne pas bloquer le rendu.

Polices de caractères (Fonts) critiques.
Contenu Principal (LCP) :

Images visibles Above the Fold (ATF).
Note : Ne pas utiliser le lazy-loading sur l'image LCP !
Interactivité & Reste de la page :

Téléchargement et exécution du JavaScript applicatif.
Ressources "Below the Fold" (BTF) chargées en lazy-loading.
Scripts tiers non-essentiels (différés).
Stratégies d'Optimisation
Preload vs Preconnect
Une confusion fréquente existe entre ces deux instructions :

Preload (<link rel="preload">) : Ordonne au navigateur de télécharger une ressource immédiatement (haute priorité) car elle sera utilisée dans la page courante (ex: Hero Image, Font critique).
Preconnect (<link rel="preconnect">) : Demande au navigateur d'établir à l'avance la connexion réseau (DNS, TCP, TLS) vers un domaine tiers (ex: Google Fonts, API). Cela ne télécharge pas le fichier, mais accélère la récupération future.
Fonts
Tout comme le Critical CSS, le CSS pour les critical fonts devrait aussi être inlined. Si l'inlining n'est pas possible, le script doit être chargé avec un preconnect. Le délai de récupération des fonts (ex: Google Fonts) peut affecter le FCP. preconnect indique au navigateur d'établir les connexions vers ces ressources plus tôt.

Inliner les fonts peut alourdir (bloat) le HTML significativement et retarder le fetch d'autres ressources critiques. Le Font fallback peut être utilisé pour débloquer le FCP et rendre le texte disponible. Cependant, utiliser un font fallback peut affecter le CLS à cause des jumping fonts. Cela peut aussi affecter l'INP à cause d'une style and layout task potentiellement lourde sur le main thread quand la vraie font arrive.

Images (LCP)
Préchargez (<link rel="preload">) la Hero Image si elle est arrive plus bas dans le DOM ou assurez-vous simplement qu'elle est dans le HTML initial sans loading="lazy".

Scripts Tiers
Utilisez des stratégies de chargement différé (ex: lazyOnload, afterInteractive en Next.js) pour ne pas bloquer le thread principal pendant le rendu initial.

Le cache
Le code le plus "vert" est celui qui ne s'exécute pas. La mise en cache est le levier le plus puissant pour réduire la charge serveur et la consommation énergétique globale.

Les niveaux de cache
1. Cache navigateur
C'est le cache stocké directement sur le device de l'utilisateur.

Impact : Élimine totalement la requête réseau.
Technique : Headers HTTP Cache-Control.
max-age=31536000, immutable pour les assets versionnés (images, JS, CSS).
stale-while-revalidate pour le contenu dynamique qui tolère un léger délai.
2. CDN & Edge Caching
Le contenu est servi depuis un serveur proche géographiquement.

Impact : Réduit la distance parcourue par les données (latence réseau) et protège le serveur d'origine.
Concepts Clés :
CDN (Content Delivery Network) : Idéal pour stocker et livrer des fichiers statiques (images, CSS, JS).
Edge Computing : Exécuter du code (logique) directement sur le CDN (ex: authentification, A/B testing, resizing d'image) pour éviter d'appeler le backend.
Comparatif : CDN vs Edge Computing
Aspect	CDN	Edge Computing
Objectif Principal	Accélérer la livraison de contenu (caching).	Traiter la donnée à la source (processing).
Architecture	Serveurs de stockage distribués.	Puissance de calcul distribuée.
Cas d'usage	Assets statiques, Streaming Vidéo.	IoT, Véhicules autonomes, IA locale.
Données	Copie et distribue.	Traite, filtre et analyse.
Latence	Réduite pour le téléchargement.	Réduite pour la prise de décision.
Sécurité	Protection DDoS, WAF.	Traitement local (données sensibles).
Coût	Bande passante & Stockage.	Temps de calcul (CPU/RAM).
3. Reverse Proxy (Varnish/Nginx)
Situé juste devant votre serveur.

Impact : "Absorbe" le trafic en servant les pages déjà générées.
Scénario idéal : Pour 1 million de visites, votre serveur ne devrait générer la page qu'une seule fois. Tout le reste devrait être servi par le cache.
4. Cache Application & Base de Données (Redis/Memcached)
Stockage en mémoire (RAM) des résultats de requêtes coûteuses.

Objectif : Éviter de recalculer ou de re-fetcher des données qui changent peu (ex: configuration, catalogue produit).
Cache status
Comprendre les headers de réponse est essentiel pour debugger.

HIT (Succès) : Le contenu a été trouvé dans le cache et servi immédiatement. C'est le scénario idéal (rapide, pas de calcul serveur).
MISS (Raté) : Le contenu n'était pas en cache. La requête a dû aller jusqu'au serveur d'origine pour être générée. Le cache stockera généralement cette réponse pour la prochaine fois.
PASS (Passer) : Le cache a décidé de ne pas stocker cette réponse (ex: page avec des données personnelles/authentifiées, headers no-store). La requête traverse le cache sans s'arrêter.
EXPIRED / STALE (Périmé) : Le contenu est en cache mais son temps de validité (max-age) est dépassé. Le cache doit vérifier avec le serveur si le contenu a changé (revalidation).
Stale-While-Revalidate
Cette directive HTTP est particulièrement intéressante pour l'expérience utilisateur et la performance :

Le navigateur sert immédiatement la version en cache (même si elle est un peu vieille/stale). -> Affichage instantané.
En arrière-plan, il vérifie si une nouvelle version existe.
Si oui, il met à jour le cache pour la prochaine visite.

Infrastructure & Sobriété
L'infrastructure (serveurs, réseaux, datacenters) représente l'autre moitié de l'impact carbone du numérique, aux côtés de la fabrication des devices.

Le Choix du Datacenter
PUE (Power Usage Effectiveness)
C'est l'indicateur d'efficacité énergétique d'un datacenter.

Formule : Énergie Totale / Énergie IT (équipement informatique)
Par exemple, un data center utilisant 50 000 kWh d'énergie, dont 40 000 kWh utilisés pour l'équipement informatique, aurait un PUE de 1,25.

Cible : Viser un PUE < 1.2 (Hyperscalers modernes).
Plus le PUE se rapproche de 1, meilleure est l'efficacité énergétique, avec un PUE entre 1,2 et 1,4 considéré comme excellent contre une moyenne française de 1,6 en 2024.

Intensité carbone de la région
Toutes les régions cloud ne se valent pas. L'électricité en France (Nucléaire/Hydro) est beaucoup moins carbonée qu'en Allemagne (Charbon/Gaz) ou en Virginie (USA).

Action : Choisir une région "Low Carbon" pour héberger vos services (ex: eu-west-3 - Paris, north-europe - Suède).
Kubernetes & Right-Sizing
Dans le cloud, on loue des ressources (vCPU, RAM). Un problème majeur est le gaspillage : des ressources réservées mais non utilisées.

Le problème du "Over-provisioning"
Pour absorber des pics de charge, on a tendance à surdimensionner les clusters.

Conséquence : Des serveurs tournent à vide, consommant de l'électricité pour rien.
Solutions d'Écoconception
Right-sizing : Ajuster précisément les requests et limits (CPU/RAM) de vos pods Kubernetes à la réalité de la consommation.
HPA (Horizontal Pod Autoscaler) : Faire varier le nombre de réplicas en fonction de la charge réelle (CPU ou métriques custom via KEDA).
Scale to Zero : Pour des environnements de dev ou de recette, éteindre complètement les pods la nuit et le week-end (ex: via Kube-Green).

Optimisation des assets
Les médias (images et vidéos) représentent souvent la plus grande part du poids d'une page. Leur optimisation est le gain rapide ("quick win") le plus efficace.

Images
Formats modernes
N'utilisez plus de JPEG ou PNG par défaut.

AVIF : Le plus performant (jusqu'à -50% vs JPEG).
WebP : Le standard actuel, supporté partout.
JPEG/PNG : Uniquement en fallback.
Images responsives (srcset)
Ne servez pas une image 4K sur un mobile. Utilisez l'attribut srcset pour laisser le navigateur choisir la meilleure image.


<img 
  src="image-800.jpg" 
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Description pertinente"
/>
Compression
Chaque image doit passer par un outil de compression avant d'être intégrée.

Outils manuels : Squoosh.app (par Google).
Outils CI/CD : Sharp, ImageMagick.

Le coût du JS
Le JavaScript est la ressource la plus coûteuse pour le navigateur. Contrairement à une image qui doit juste être décodée, le JS doit être téléchargé, parsé, compilé et exécuté.

Le coût des dépendances
Avant d'installer une librairie via npm, vérifier son coût réel.

Outil : Bundlephobia
Exemple : Avez-vous besoin de tout lodash (70kB) ou juste d'une petite fonction utilitaire ?
Réduire la taille du bundle
Tree shaking
C'est la capacité du bundler (Webpack, Vite, Rollup) à éliminer le code mort (les exports non utilisés).

Condition : Utiliser les modules ES6 (import / export) et non CommonJS (require).
Code splitting
Au lieu d'envoyer un énorme fichier bundle.js contenant tout le site, on découpe le code en petits morceaux (chunks).

Par page : L'utilisateur ne télécharge que le JS nécessaire à la page qu'il visite.
Lazy Loading : On ne charge le code d'un composant lourd (ex: un graphique interactif) que s'il devient visible ou si l'utilisateur clique dessus.

// Exemple de Dynamic Import (Lazy Loading)
const HeavyChart = React.lazy(() => import('./HeavyChart'));
Limiter la taille du bundle
Définissez des limites strictes pour éviter la régression au fil du temps.

Exemple : "Le bundle initial ne doit jamais dépasser 150kB gzippé".
Configurez ces budgets dans votre configuration Webpack/Vite ou via Lighthouse CI.

Anti-patterns
L'écoconception ne s'arrête pas à l'architecture.
La manière dont on écrit le code peut avoir un impact massif sur la consommation des ressources (CPU, RAM, Réseau), surtout à grande échelle.

Voici quelques anti-patterns courants:

Le n+1 select
C'est l'erreur classique, souvent masquée par les ORM. Vous récupérez une liste d'objets, puis vous bouclez dessus pour récupérer une information liée.

Le code énergivore

// On récupère 100 utilisateurs
const users = await db.query("SELECT * FROM users LIMIT 100");
// On se retrouvwe avec une requête SQL par utilisateur
for (const user of users) {
  user.posts = await db.query("SELECT * FROM posts WHERE user_id = ?", [user.id]);
}
Solution possible
Les requêtes multiples
Le frontend a besoin d'afficher les détails de 10 produits. Il lance 10 requêtes AJAX simultanées.

Le code énergivore

const productIds = [1, 2, 3, 4, 5, ...];
// sature le réseau et le thread du navigateur
const products = await Promise.all(
  productIds.map(id => fetch(`/api/products/${id}`))
);
Solution possible
Créez des endpoints qui acceptent des lots (batching).


// une seule requête HTTP
const response = await fetch(`/api/products?ids=${productIds.join(',')}`);
const products = await response.json();
Gain : moins de consommation batterie sur mobile.

L'Over-fetching (REST vs GraphQL)
Vous avez besoin d'afficher juste le nom et l'avatar d'un utilisateur dans une liste. Mais votre API REST renvoie l'objet utilisateur complet.

Le code énergivore

// GET /api/users/42
// Le serveur renvoie un JSON énorme du style
{
  "id": 42,
  "name": "Alice",
  "avatar": "alice.jpg",
  "address": { "street": "...", "city": "..." }, // Inutile
  "preferences": { ... }, // Inutile
  "history": [ ... ] // Inutile et très lourd !
}
Solution possible
Utilisez GraphQL (ou une API REST avec des champs partiels) pour ne demander que le strict nécessaire.


# La réponse ne fera que quelques octets
query {
  user(id: 42) {
    name
    avatar
  }
}
Gain : Économie de bande passante et de parsing JSON (CPU/batterie).