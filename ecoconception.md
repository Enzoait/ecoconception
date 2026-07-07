# Audit d'écoconception — Luxe Motors

> Document vivant : les parties marquées **[À COMPLÉTER PAR TOI]** nécessitent l'exécution d'outils en ligne / navigateur que je ne peux pas piloter depuis ce contexte. Le reste (analyse statique du code, de l'architecture et des dépendances) a été vérifié directement dans le dépôt.

---

## Introduction

### Présentation du service

**Luxe Motors** est un site e-commerce de véhicules de luxe/exception (hypercars, supercars, grand tourisme, SUV) construit sur le template `nextjs-template-mongodb` :

- **Stack** : Next.js 16 (App Router), React 19, TypeScript strict, MongoDB (driver officiel `mongodb` v7), Tailwind CSS 3 + shadcn/ui, authentification JWT maison (`jose` + cookie httpOnly) avec middleware de protection de routes (`proxy.ts`).
- **Parcours fonctionnels** : catalogue filtrable (`/vehicles`), fiche véhicule (`/vehicles/[id]`), panier (`/cart`), collection personnelle des véhicules achetés (`/collection`), inscription/connexion (`/auth/*`).
- **Hébergement cible** : Vercel + MongoDB Atlas (déploiement en un clic documenté dans le README d'origine).

### Justification du choix

Le dépôt est passé d'un template minimal (une simple page de statut de connexion MongoDB) à une véritable application full-stack (commits « site ecommerce »). Il combine :
- du rendu mixte client/serveur,
- des appels base de données réels (avec des patterns à risque comme le N+1),
- des médias externes non maîtrisés,
- un système d'authentification,
- une UI riche (animations, thème sombre, typographies custom).

C'est donc un périmètre représentatif pour appliquer les 5 piliers de l'écoconception et un sous-ensemble pertinent du RGESN, avec un existant suffisamment petit pour être audité de façon exhaustive (peu de pages, peu de dépendances) mais suffisamment réaliste pour révéler de vrais anti-patterns.

### Périmètre de l'audit

**Inclus** :
- Pages : `/`, `/vehicles`, `/vehicles/[id]`, `/cart`, `/collection`, `/auth/login`, `/auth/register`.
- Routes API : `/api/vehicles`, `/api/vehicles/[id]`, `/api/cart*`, `/api/collection`, `/api/auth/*`, `/api/seed`, `/api/health`.
- Assets : polices (`next/font/google`), images produits, CSS (Tailwind), bundle JS.
- CI existante (`.github/workflows/ci.yml`).

**Exclu** (hors d'accès depuis ce dépôt) :
- Configuration réelle du cluster MongoDB Atlas (région, tiering, PUE du datacenter réellement utilisé).
- Données de trafic réel / analytics de production (le site n'est pas déployé publiquement dans le cadre de cet audit).
- Applications mobiles natives (le service est uniquement web responsive).

### Critères RGESN retenus

Le RGESN structure ses 78 critères en 8 thématiques. Compte tenu du périmètre (code + assets, pas d'accès à l'infra de prod), nous concentrons l'audit sur les familles suivantes :

| Thématique RGESN | Ce qui est vérifié dans cet audit |
| --- | --- |
| **Stratégie** | Le service a-t-il un périmètre fonctionnel maîtrisé, sans fonctionnalité superflue ? (Partie 5) |
| **Spécifications / UX** | Les parcours utilisateurs sont-ils sobres, sans étape ou requête inutile ? (Partie 5) |
| **Architecture** | Choix de rendu (SSR/CSR), gestion du cache, requêtes réseau/DB (N+1, over-fetching, pagination) (Parties 1 & 3) |
| **Frontend** | Poids des pages, JS/CSS livrés, images, polices, Core Web Vitals (Parties 1 & 2) |
| **Backend / Algorithmique** | Efficacité des requêtes MongoDB, absence de traitements redondants côté serveur (Partie 3) |
| **Contenus** | Optimisation et formats des médias (images véhicules) (Parties 1 & 5) |
| **Accessibilité** (transverse RGESN + RGAA) | Conformité WCAG de base : labels, focus, contraste, alternatives textuelles (Partie 4) |
| **Hébergement** | Non auditable en détail ici (pas d'accès à l'infra Vercel/Atlas réelle) — indications données en Partie 6 pour un futur audit avec accès prod. |

---

## Partie 1 : Audit Webperf Initial

### Constats déjà identifiés dans le code (statique)

1. **Rendu 100 % client sur les pages à forte valeur** : `/vehicles`, `/vehicles/[id]`, `/cart`, `/collection` sont des Client Components (`"use client"`) qui fetchent leurs données via `useEffect` + `fetch` **après** l'hydratation. Le HTML initial ne contient qu'un spinner (`animate-spin`). Conséquence attendue : FCP correct (coquille vide) mais LCP et contenu utile retardés d'un aller-retour réseau supplémentaire, rien d'indexable pour un crawler ou un mode dégradé.
2. **Image LCP correctement préchargée** sur la fiche véhicule : `<Image ... priority />` (`app/vehicles/[id]/page.tsx:85`) — bon point à confirmer dans le rapport Lighthouse ("Preload LCP image" doit être vert).
3. **Polices** chargées via `next/font/google` (`app/fonts.js`) avec `display: "swap"` → auto-hébergement au build, pas de requête vers `fonts.gstatic.com` attendue, bon point pour le FCP.
4. **Images produits hors de tout contrôle** : 9 domaines tiers différents déclarés dans `next.config.ts` (`images.unsplash.com`, `picsum.photos`, `media.gqmagazine.fr`, `upload.wikimedia.org`, `res.cloudinary.com`, `cdn.motor1.com`, `images.caradisiac.com`, `www.pushstart.it`, `octane.rent`). Une seule URL Cloudinary embarque même une chaîne de transformation non maîtrisée par le site. Next/Image ré-optimise à la volée, mais le poids/format source et la disponibilité dépendent entièrement de tiers non contrôlés.
5. **Aucun header de cache HTTP** sur les routes `/api/*` (Route Handlers Next.js par défaut = dynamiques, `Cache-Control` non défini) → chaque navigation revalide tout depuis MongoDB, y compris pour des données peu volatiles comme le catalogue.

### [À COMPLÉTER PAR TOI]

Pour chacune des pages `/vehicles`, `/vehicles/[id]/<un-id-existant>`, `/cart`, `/collection`, `/auth/login` :

1. Build de prod puis lancement local :
   ```bash
   npm run build && npm start
   ```
2. Lighthouse (Chrome DevTools, onglet **Lighthouse**, profils **Mobile** et **Desktop**, catégories Performance + Accessibilité + Bonnes pratiques + SEO) — ou en CLI :
   ```bash
   npx lighthouse http://localhost:3000/vehicles --view --preset=desktop
   npx lighthouse http://localhost:3000/vehicles --view
   ```
3. [PageSpeed Insights](https://pagespeed.web.dev/) sur l'URL déployée si disponible (donne un score terrain "Chrome UX Report" en plus du score labo).
4. [WebPageTest](https://www.webpagetest.org/) avec un profil réseau "4G" pour visualiser la *Loading Sequence* (waterfall) et vérifier si les scripts tiers ou le JS applicatif retardent le FCP/LCP.

Reporter les résultats dans le tableau ci-dessous :

| Page | Device | LCP | INP | CLS | FCP | TBT | Score Perf | Score A11y |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /vehicles | Mobile | | | | | | | |
| /vehicles | Desktop | | | | | | | |
| /vehicles/[id] | Mobile | | | | | | | |
| /cart | Mobile | | | | | | | |
| /collection | Mobile | | | | | | | |
| /auth/login | Mobile | | | | | | | |

---

## Partie 2 : Analyse des Dépendances et du "Poids Mort" Applicatif

### Constats déjà identifiés dans le code (statique)

- **Dépendances directes** : 12 en runtime (`@radix-ui/react-slot`, `bcryptjs`, `class-variance-authority`, `clsx`, `jose`, `lucide-react`, `mongodb`, `next`, `react`, `react-dom`, `tailwind-merge`, `tailwindcss-animate`) + 8 en dev. C'est un socle **déjà frugal** : pas de `lodash`, `moment`, ou librairie UI lourde superflue.
- **Kit UI mort constaté** : `components/ui/button.tsx` et `components/ui/badge.tsx` (composants shadcn générés) ne sont importés **nulle part** dans le code applicatif (vérifié par recherche globale). À la place, chaque page réimplémente à la main des boutons/badges avec de longues chaînes Tailwind dupliquées (`vehicle-card.tsx`, `app/vehicles/page.tsx`, `app/cart/page.tsx`, `app/collection/page.tsx`, `app/auth/login/page.tsx`, `navbar-client.tsx`). Conséquences :
  - `@radix-ui/react-slot`, `class-variance-authority` et une partie de `tailwind-merge` sont embarqués pour un composant jamais utilisé ;
  - duplication de logique de style contraire au pilier **Longévité & Maintenabilité** (toute évolution visuelle du bouton doit être répétée à la main dans ~6 fichiers).
  - **Recommandation** : soit supprimer `button.tsx`/`badge.tsx` et les dépendances associées si l'UI codée à la main est le choix définitif, soit migrer les boutons/badges dupliqués vers ces composants partagés.
- **node_modules** pèse 509 Mo / 349 paquets, mais c'est en grande majorité de la toolchain (Next.js, Playwright, TypeScript, ESLint) qui ne part jamais au navigateur — ce chiffre n'est pas un indicateur pertinent pour l'utilisateur final, seul le JS réellement expédié par route l'est (cf. ci-dessous).

### [À COMPLÉTER PAR TOI]

1. **Taille réelle du JS livré par route** — lire la table affichée par :
   ```bash
   npm run build
   ```
   (colonnes "First Load JS" par route). Comparer chaque route à un budget indicatif de 150 kB gzippé pour le bundle initial.
2. **Bundle analyzer** pour visualiser la composition du bundle client :
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```
   puis wrapper `next.config.ts` avec `withBundleAnalyzer` et lancer `ANALYZE=true npm run build`.
3. **Code mort restant** (exports/fichiers jamais utilisés au-delà de `button.tsx`/`badge.tsx`) :
   ```bash
   npx knip
   npx depcheck
   npx ts-prune
   ```
4. **Coût réel des dépendances** sur [Bundlephobia](https://bundlephobia.com/) pour `lucide-react`, `jose`, `bcryptjs`, `mongodb` — vérifier notamment que les icônes `lucide-react` sont bien importées nommément (`import { X } from "lucide-react"`, déjà le cas dans le code) pour bénéficier du tree-shaking ESM et ne pas embarquer l'intégralité de la librairie d'icônes.

---

## Partie 3 : Profiling Applicatif et Analyse Runtime

### Constats déjà identifiés dans le code (statique)

**Points positifs (patterns déjà corrects) :**
- `GET /api/cart` et `GET /api/collection` évitent le N+1 : ils récupèrent les IDs véhicules du panier/de la collection puis font **une seule requête** `find({ _id: { $in: vehicleIds } })` (batching), au lieu d'une requête par article.

**Points à corriger :**
- `GET /api/vehicles` (`app/api/vehicles/route.ts`) n'a **aucune pagination/limite** (`.find(query).toArray()` sans `.limit()`). Sans risque avec les 12 véhicules du seed actuel, mais dette technique certaine dès que le catalogue grossira — à corriger avant mise en production réelle (pagination ou `limit` + `skip`/curseur).
- **Recherche non debouncée** : sur `/vehicles`, chaque frappe dans le champ de recherche déclenche immédiatement `fetchVehicles()` (le `useEffect` dépend de `search` via `useCallback`), donc une requête HTTP + une requête MongoDB `$regex` par caractère tapé. Coût CPU/réseau/batterie inutile côté client et serveur pour un gain UX marginal. Recommandation : debounce de 300–400 ms et/ou déclenchement à partir de 2-3 caractères.
- **Filtres `minPrice`/`maxPrice` implémentés côté API mais jamais appelés depuis l'UI** (`app/vehicles/page.tsx` ne construit jamais ces paramètres) : code mort fonctionnel côté backend, à retirer ou à réellement exposer dans l'interface.
- **Cascade de rendu côté client** : sur chaque page listée en Partie 1, le cycle est *téléchargement JS → hydratation → fetch → 2ᵉ rendu*. Convertir ces pages en Server Components avec appel direct à `clientPromise`/MongoDB (comme le faisait la page d'accueil du template d'origine, cf. `EDD.md`) supprimerait un aller-retour réseau complet et les spinners systématiques.
- `bcrypt.hash(password, 12)` (`app/api/auth/register/route.ts`) : coût de hachage standard et raisonnable pour de la sécurité — **pas un problème d'écoconception**, aucun changement recommandé ici (le contraire — baisser le coût — dégraderait la sécurité pour un gain énergétique négligeable).

### [À COMPLÉTER PAR TOI]

1. **Chrome DevTools → Performance** : enregistrer un tracé pendant le chargement de `/vehicles` et pendant une frappe dans le champ de recherche ; vérifier la durée du thread principal bloqué (Total Blocking Time) et le nombre de requêtes réseau déclenchées lors de la frappe.
2. **React DevTools → Profiler** : profiler `/vehicles` pendant le changement de filtre/tri pour vérifier si toute la grille de cartes se re-rend inutilement.
3. **Réseau (onglet Network)** : sur `/cart` et `/collection`, confirmer qu'il n'y a bien qu'un seul appel `/api/cart` ou `/api/collection` (pas de requête par article), pour valider l'absence de N+1 côté frontend également.
4. **Monitoring continu** (non installé actuellement — gap à noter) : si un suivi en production est souhaité, intégrer *Sentry* pour les erreurs/traces de performance, et *Pyroscope* pour le profiling continu CPU/mémoire côté serveur. Ceci est une recommandation, pas un pré-requis pour cet audit.

---

## Partie 4 : Audit d'Accessibilité Approfondi

### Constats déjà identifiés dans le code (statique)

1. **Labels de formulaire non associés (bug avéré)** : sur `/auth/login` et `/auth/register`, les `<label>` n'ont pas d'attribut `htmlFor` et les `<input>` n'ont pas d'`id` correspondant (`app/auth/login/page.tsx:50-60`). Un lecteur d'écran ne peut pas annoncer le libellé du champ, et l'autofill du navigateur est dégradé. **Non-conformité WCAG 1.3.1 / 4.1.2.**
2. **Boutons icône-seule sans texte accessible** :
   - bouton d'effacement de la recherche (icône `X`) sur `/vehicles` ;
   - bouton de suppression d'article (icône `Trash2`) sur `/cart` ;
   - bouton "Filtres" qui perd son libellé visible en mobile (`hidden sm:inline` sur le `<span>`, mais aucun `aria-label` de secours) ;
   - icônes panier/collection dans la navbar mobile (`navbar-client.tsx`).
   Aucun de ces boutons n'a d'`aria-label` : ils sont muets pour un lecteur d'écran.
3. **Thème sombre forcé en dur** : `className="dark"` codé en dur sur `<html>` (`app/layout.tsx:17`), sans respect de `prefers-color-scheme` ni possibilité de bascule utilisateur. Point négatif pour l'agentivité/accessibilité (un utilisateur qui a besoin du thème clair ne peut pas l'obtenir), à mettre en balance avec un point positif énergétique (un thème sombre réduit la consommation des écrans OLED).
4. **Beaucoup de texte à contraste/lisibilité potentiellement limite** : usage récurrent de `text-[10px]`/`text-[11px] font-light uppercase tracking-widest text-muted-foreground` (labels, méta-infos prix/puissance/stock). À un poids de police aussi faible et une taille aussi petite, le ratio de contraste doit être vérifié précisément (WCAG AA exige ≥ 4.5:1 pour du texte < 18px/24px gras).
5. **Points positifs déjà en place** : `lang="fr"` correctement déclaré sur `<html>` ; tous les `<Image>` ont un `alt` descriptif (`${brand} ${model}`) ; les champs de formulaire ont `required` natif.

### [À COMPLÉTER PAR TOI]

1. **axe DevTools** (extension Chrome/Firefox) sur `/auth/login`, `/vehicles`, `/cart` → export du rapport de violations.
2. **WAVE** (wave.webaim.org ou extension) sur les mêmes pages, en complément d'axe (les deux outils ne détectent pas exactement les mêmes problèmes).
3. **Lighthouse → catégorie Accessibilité** (déjà lancé en Partie 1, relire spécifiquement les items échoués).
4. **Navigation clavier seule** : parcourir `/vehicles` puis `/cart` uniquement au clavier (Tab/Shift+Tab/Entrée) — vérifier que le focus est toujours visible et que l'ordre de tabulation est logique.
5. **Contraste** : vérifier au [Contrast Checker WebAIM](https://webaim.org/resources/contrastchecker/) les couples de couleurs `muted-foreground` (`hsl(0 0% 55%)`) sur `background` (`hsl(0 0% 4%)`) et le texte doré (`#C9A84C`) sur les badges `gold/10`.
6. **Lecteur d'écran** (NVDA sur Windows ou VoiceOver) : test manuel du formulaire de connexion et du flux "ajouter au panier" sur la fiche véhicule.

---

## Partie 5 : Analyse de la Sobriété Fonctionnelle et UX/UI

### Constats déjà identifiés dans le code (statique)

**Points positifs** :
- Le périmètre fonctionnel est déjà resserré : catalogue, fiche produit, panier, collection, authentification — pas de chat, pas de recommandations algorithmiques, pas de vidéo en autoplay, aucun script d'analytics/publicité tiers détecté dans le code. Le pilier **Frugalité** est globalement respecté au niveau du périmètre.

**Points à corriger** :
1. **Fonctionnalité de "seed" exposée en UI de production** : le bouton "Initialiser le catalogue" (`handleSeed` dans `app/vehicles/page.tsx`) déclenche `POST /api/seed`, une route pensée pour l'initialisation en développement, directement accessible à n'importe quel visiteur si le catalogue est vide. C'est une fonctionnalité de dev qui fuit en prod : à retirer de l'UI ou à protéger derrière un rôle admin/variable d'environnement.
2. **Recherche non debouncée** (déjà noté en Partie 3) : sur-sollicitation réseau/DB pour un gain UX marginal — relève autant de la sobriété fonctionnelle que de la performance runtime.
3. **Filtres prix (`minPrice`/`maxPrice`) codés côté API mais absents de l'UI** : soit du code mort à supprimer, soit une fonctionnalité utile non finalisée à exposer — à trancher plutôt que laisser les deux états coexister.
4. **Animations cumulées** : `hover:scale-105` + `transition-transform duration-500` sur chaque carte véhicule, `scroll-behavior: smooth` appliqué globalement sur `<html>` (`app/globals.css:62`). Impact unitaire faible, mais cumulé sur une grille de plusieurs dizaines de cartes sur un mobile d'entrée de gamme, cela sollicite inutilement le compositing/GPU. Par ailleurs, aucune règle `prefers-reduced-motion` n'est gérée : les utilisateurs ayant demandé la réduction des animations au niveau système ne sont pas respectés.
5. **Écrans de chargement systématiques** (spinner plein écran à chaque navigation faute de rendu serveur, cf. Parties 1 & 3) dégradent la performance perçue autant que réelle.

### [À COMPLÉTER PAR TOI]

1. Parcourir manuellement le tunnel complet (recherche → filtre → fiche véhicule → ajout panier → paiement → collection) et noter toute étape qui pourrait être supprimée, fusionnée ou rendue optionnelle.
2. Si une solution d'analytics est ajoutée à l'avenir, vérifier son poids et sa politique de collecte de données via [Bundlephobia](https://bundlephobia.com/) et le principe de minimisation des données (RGPD/RGESN thème Contenus).
3. Documenter avec [EcoIndex.fr](https://www.ecoindex.fr/) le score (A à G), le nombre de requêtes et le poids de page sur `/vehicles` et `/vehicles/[id]`, en le mettant en regard du nombre d'éléments DOM (grille de cartes).

---

## Partie 6 : Synthèse des Audits & Plan d'Action

### Tableau de synthèse

| # | Constat | Pilier(s) impacté(s) | Sévérité | Effort | Action recommandée |
| --- | --- | --- | --- | --- | --- |
| 1 | Labels de formulaire non associés (`htmlFor`/`id`) | Accessibilité | Élevée | Faible | Ajouter `id` sur les `<input>` et `htmlFor` sur les `<label>` (login + register) |
| 2 | Boutons icône-seule sans `aria-label` | Accessibilité | Élevée | Faible | Ajouter `aria-label` sur les boutons X, corbeille, filtres, icônes navbar mobile |
| 3 | Bouton "Initialiser le catalogue" exposé en prod | Frugalité, Sécurité | Élevée | Faible | Retirer de l'UI publique ou protéger par rôle admin |
| 4 | Recherche non debouncée | Efficience, Frugalité | Moyenne | Faible | Debounce 300-400 ms sur le champ de recherche |
| 5 | `/api/vehicles` sans pagination | Efficience, Longévité | Moyenne (latente) | Faible | Ajouter `.limit()`/pagination avant croissance du catalogue |
| 6 | Filtres prix orphelins (API sans UI) | Frugalité, Maintenabilité | Faible | Faible | Supprimer le code mort ou finaliser l'UI |
| 7 | Kit UI shadcn (`button.tsx`/`badge.tsx`) jamais utilisé | Longévité & Maintenabilité, Efficience | Moyenne | Faible/Moyen | Migrer les boutons/badges dupliqués vers ces composants ou supprimer le kit + dépendances associées |
| 8 | Pas de header de cache sur les routes `/api/*` | Efficience, Infrastructure | Moyenne | Moyen | `Cache-Control`/`stale-while-revalidate` sur `/api/vehicles` (données peu volatiles) |
| 9 | Pages catalogue/panier/collection en Client Component + fetch après hydratation | Performance, Efficience | Élevée | Élevé | Migrer vers Server Components avec accès direct MongoDB (SSR/RSC) |
| 10 | Images produits hotlinkées depuis 9 domaines tiers non maîtrisés | Contenus, Performance | Moyenne | Moyen | Héberger/optimiser les médias en interne (AVIF/WebP, pipeline de compression) |
| 11 | Thème sombre forcé, `prefers-reduced-motion` ignorée | Accessibilité | Moyenne | Faible | Respecter les préférences système, ou justifier explicitement le choix de marque |
| 12 | Pas de CI de performance (Lighthouse CI, budget JS) | Longévité, Efficience | Moyenne | Moyen | Ajouter un job Lighthouse CI + budget de bundle dans `.github/workflows/ci.yml` |
| 13 | Pas de monitoring runtime (Sentry/Pyroscope) | Longévité, Efficience | Faible | Moyen | Intégrer un suivi d'erreurs/performance si le service passe en production réelle |

### Priorisation

**Quick wins (à traiter en premier, faible effort / fort impact)** : #1, #2, #3, #4, #6.

**Chantiers structurants (effort plus élevé, impact durable)** : #9 (bascule SSR/RSC — le plus gros gain attendu sur les Core Web Vitals), #10 (pipeline images), #7 (nettoyage du kit UI), #8 et #12 (mise en place d'un cadre de non-régression performance).

### Récapitulatif des outils externes à exécuter (voir chaque partie pour le détail)

- **Partie 1** : Lighthouse (Chrome DevTools ou CLI), PageSpeed Insights, WebPageTest.
- **Partie 2** : `npm run build` (table First Load JS), `@next/bundle-analyzer`, `knip`/`depcheck`/`ts-prune`, Bundlephobia.
- **Partie 3** : Chrome DevTools Performance, React DevTools Profiler, (optionnel) Sentry/Pyroscope.
- **Partie 4** : axe DevTools, WAVE, Lighthouse Accessibilité, test clavier, WebAIM Contrast Checker, lecteur d'écran (NVDA/VoiceOver).
- **Partie 5** : EcoIndex.fr, parcours manuel des tunnels utilisateurs.

Une fois ces mesures collectées et reportées dans les tableaux ci-dessus, ce document constituera la base du rapport d'écoconception complet (constat chiffré + plan d'action priorisé).
