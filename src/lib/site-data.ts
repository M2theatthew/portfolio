export type PinIcon =
  | "home"
  | "chart"
  | "cloud"
  | "wifi"
  | "utensils"
  | "tree"
  | "church"
  | "store"
  | "hammer"
  | "code"
  | "board";
export type PinTone = "teal" | "amber";

export type Project = {
  id: string;
  name: string;
  category: string;
  /** Short descriptor shown after the category, e.g. "5 pages" or "Weather app". */
  detail: string;
  summary: string;
  image: string;
  icon: PinIcon;
  tone: PinTone;
  featured?: boolean;
  /** Town shown before the category on cards. Leave off for software / coursework. */
  city?: string;
  /**
   * Link to the live site or demo (opens in a new tab). Leave off when there is
   * nothing public to link to — the card is then shown without a link.
   */
  href?: string;
  /** Only projects with a real-world location get a pin on the 3D map. */
  lat?: number;
  lng?: number;
};

/** A project that gets a pin on the hero map. */
export type MappedProject = Project & { city: string; lat: number; lng: number };

export function isMapped(project: Project): project is MappedProject {
  return (
    typeof project.lat === "number" && typeof project.lng === "number" && Boolean(project.city)
  );
}

export const NAV = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export const SITE_URL = "https://upstatetechnologysolutions.com";

export const BRAND_CONTACT = {
  name: "Matthew Hunt",
  role: "Founder",
  phone: "(480) 492-1911",
  phoneHref: "tel:+14804921911",
  email: "contact@upstatetechnologysolutions.com",
  emailHref: "mailto:contact@upstatetechnologysolutions.com",
  location: "Honea Path, SC",
  github: "https://github.com/M2theatthew",
} as const;

/**
 * Optional: a form-handling endpoint (e.g. a Formspree form URL like
 * "https://formspree.io/f/xxxxxxx"). When set, the contact form posts to it and
 * shows a confirmation on the page. When empty, the form falls back to opening
 * the visitor's mail app / Gmail with the message pre-filled, which needs no
 * third-party service.
 */
export const CONTACT_FORM_ENDPOINT: string = "";

/** Geographic bounds matching the South Carolina GLB AABB. */
export const SC_BOUNDS = {
  west: -83.3539,
  east: -78.541,
  south: 32.0346,
  north: 35.2155,
  xExtent: 1,
  yExtent: 0.72622478,
} as const;

export function geoToMap(lat: number, lng: number): [number, number] {
  const x = ((lng - SC_BOUNDS.west) / (SC_BOUNDS.east - SC_BOUNDS.west)) * SC_BOUNDS.xExtent;
  const y = ((lat - SC_BOUNDS.south) / (SC_BOUNDS.north - SC_BOUNDS.south)) * SC_BOUNDS.yExtent;
  return [x, y];
}

/**
 * Where each pin sits on the 3D map. These are display positions, placed by eye
 * on the map model to spread the pins across the Upstate; a project's `city`
 * (shown on cards) is where the client actually is. To move a pin, point the
 * project's `...PIN.xxx` line at a different spot (or add a new one below).
 */
const PIN = {
  honeaPath: { lat: 34.4465, lng: -82.3915 },
  anderson: { lat: 34.5034, lng: -82.6501 },
  west: { lat: 34.661, lng: -83.146 },
  north: { lat: 34.752, lng: -82.437 },
  east: { lat: 34.275, lng: -82.08 },
  south: { lat: 33.996, lng: -82.487 },
  // Spare spots that were marked on the map but aren't used by a project yet.
  spareNorthwest: { lat: 34.719, lng: -82.868 },
  spareNearHoneaPath: { lat: 34.623, lng: -82.291 },
} as const;

/** Real work, in the order it appears in the grid (featured first). */
export const PROJECTS: Project[] = [
  {
    id: "honea-path",
    name: "Empower Honea Path",
    category: "Nonprofit",
    detail: "5 pages",
    summary: "Community organization site with About, Get Involved, Events, and Contact pages.",
    image: "/images/work/empower.jpg",
    icon: "home",
    tone: "teal",
    featured: true,
    city: "Honea Path",
    href: "/work/empower-honea-path/index.html",
    ...PIN.honeaPath,
  },
  {
    id: "first-baptist",
    name: "Honea Path First Baptist Church",
    category: "Church",
    detail: "3 pages",
    summary:
      "Full church site with leadership bios and a Celebrate Recovery ministry page, built around a custom video hero.",
    image: "/images/work/church.jpg",
    icon: "church",
    tone: "amber",
    featured: true,
    city: "Honea Path",
    href: "/work/honea-path-church/index.html",
    ...PIN.west,
  },
  {
    id: "lou-perrys",
    name: "Lou & Perry's",
    category: "Restaurant",
    detail: "1 page",
    summary: "Restaurant site for Lou & Perry's on N. Main Street in Honea Path, established 1985.",
    image: "/images/work/lou-perrys.jpg",
    icon: "utensils",
    tone: "teal",
    city: "Honea Path",
    href: "/work/lou-perrys/index.html",
    ...PIN.north,
  },
  {
    id: "weatherly",
    name: "Weatherly",
    category: "Software",
    detail: "Weather app",
    summary:
      "Premium weather app with live Open-Meteo data, multi-location tracking, and a radar view, with animated precipitation over atmosphere video matched to conditions.",
    image: "/images/work/weatherly.jpg",
    icon: "cloud",
    tone: "teal",
    href: "/work/weatherly/index.html",
  },
  {
    id: "local-crm",
    name: "Lightweight Local CRM",
    category: "Software",
    detail: "Business suite",
    summary:
      "Full business-suite app covering customers, inventory, checkout, invoicing, payments, and reporting, running entirely on a local network.",
    image: "/images/work/local-crm.jpg",
    icon: "chart",
    tone: "amber",
    featured: true,
    city: "Anderson",
    href: "/work/local-crm/index.html",
    ...PIN.anderson,
  },
  {
    id: "liveboard",
    name: "LiveBoard",
    category: "Software",
    detail: "3D multiplayer",
    summary:
      "Real-time multiplayer 3D whiteboard with physics-driven markers, a sticky-note kanban board, live drawing sync, and chat. Built with React Three Fiber and Rapier.",
    image: "/images/work/liveboard.jpg",
    icon: "board",
    tone: "teal",
    href: "/work/liveboard/index.html",
  },
  {
    id: "melt-pizzeria",
    name: "The Melt Pizzeria",
    category: "Restaurant",
    detail: "1 page",
    summary:
      "\u201cLocal toppings. Better pizza.\u201d A pizzeria site with a menu and brand-forward design.",
    image: "/images/work/melt.jpg",
    icon: "utensils",
    tone: "amber",
    city: "Honea Path",
    href: "/work/melt-pizzeria/index.html",
    ...PIN.east,
  },
  {
    id: "green-dragon",
    name: "The Green Dragon Vape Lounge",
    category: "Retail",
    detail: "1 page",
    summary: "Vape lounge site for a Honea Path storefront.",
    image: "/images/work/green-dragon.jpg",
    icon: "store",
    tone: "teal",
    city: "Honea Path",
    href: "/work/green-dragon/index.html",
    ...PIN.south,
  },
  {
    id: "eoin-reardon",
    name: "Eoin Reardon",
    category: "Craft",
    detail: "2 pages",
    summary: "A craftsman's site for traditional Irish woodwork, with a browsable shop page.",
    image: "/images/work/eoin-reardon.jpg",
    icon: "hammer",
    tone: "amber",
    href: "/work/eoin-reardon/index.html",
  },
  {
    id: "wifi-monitor",
    name: "WiFi Monitor",
    category: "Software",
    detail: "Desktop + web",
    summary:
      "Fully local network dashboard for Windows: live device list, Wi-Fi link status, a bandwidth graph, and a desktop widget.",
    image: "/images/work/wifi-monitor.jpg",
    icon: "wifi",
    tone: "teal",
    href: "/work/wifi-monitor/index.html",
  },
];

/** Projects that get a pin on the hero map (the ones with a real location). */
export const MAPPED_PROJECTS: MappedProject[] = PROJECTS.filter(isMapped);

/**
 * Pins that land close together (the Honea Path clients) keep their glowing
 * ground markers at their own spots, but their icon tiles floating above are
 * spread sideways, in screen pixels, so the tiles don't stack on each other.
 */
export const PIN_TILE_SPACING_PX = 40;
/** Pins within this many degrees (~8 miles) of each other count as one cluster. */
const CLUSTER_RADIUS_DEG = 0.12;

export type PinLayout = {
  /** Horizontal shift of the icon tile in px (0 for a pin that is alone). */
  dx: number;
  /** True when other pins are nearby, so the label sits above the tile. */
  clustered: boolean;
};

export function pinLayouts(projects: MappedProject[]): Record<string, PinLayout> {
  const clusters: MappedProject[][] = [];
  for (const project of projects) {
    const home = clusters.find((cluster) =>
      cluster.some(
        (other) =>
          Math.hypot(other.lat - project.lat, other.lng - project.lng) <= CLUSTER_RADIUS_DEG,
      ),
    );
    if (home) home.push(project);
    else clusters.push([project]);
  }
  const layouts: Record<string, PinLayout> = {};
  for (const cluster of clusters) {
    // West to east, so tiles line up roughly the way their pins sit on the map.
    const ordered = [...cluster].sort((x, y) => x.lng - y.lng);
    ordered.forEach((project, index) => {
      layouts[project.id] = {
        dx: (index - (ordered.length - 1) / 2) * PIN_TILE_SPACING_PX,
        clustered: ordered.length > 1,
      };
    });
  }
  return layouts;
}

export type ServiceIconName = "code" | "cogs" | "app" | "idea" | "flow" | "laptop";

export const SERVICES: {
  id: string;
  title: string;
  body: string;
  icon: ServiceIconName;
}[] = [
  {
    id: "websites",
    title: "Websites",
    body: "A site that actually represents your business, hand-built and easy to keep up with. Still the most common place to start.",
    icon: "code",
  },
  {
    id: "automation",
    title: "Business Automation",
    body: "Fixing the repetitive stuff: the same info typed into three different places, the manual process everyone dreads doing.",
    icon: "cogs",
  },
  {
    id: "internal-tools",
    title: "Internal Tools & Web Apps",
    body: "Small custom tools built for how your business actually runs, when a spreadsheet or a sticky note has hit its limit.",
    icon: "app",
  },
  {
    id: "consulting",
    title: "Process Improvement & Consulting",
    body: "Sometimes the fix isn't code at all. An outside look at how something's organized can be worth more than a new tool.",
    icon: "idea",
  },
  {
    id: "integration",
    title: "Systems Integration",
    body: "Getting the tools you already use to actually talk to each other, so you're not stuck re-entering the same information.",
    icon: "flow",
  },
  {
    id: "repair",
    title: "Computer Repair & Hardware Installation",
    body: "Diagnosing and fixing the machines you already own, and setting up new hardware right the first time.",
    icon: "laptop",
  },
] as const;

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  image: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Working with Upstate Technology Solutions was a game-changer for Upstate Pottery Co. Matthew didn't just build us a website; he created a digital home that truly reflects our brand and values. His local understanding and ongoing support are invaluable. Highly recommend him!",
    name: "Sarah Jenkins",
    role: "Co-Founder, Upstate Pottery Co.",
    initials: "SJ",
    image: "/images/sarah.jpg",
  },
  {
    quote:
      "Matthew didn't just launch a site for Town Cafe. He built us an online presence that actually brings people through the door. Local, responsive, and he just gets small business.",
    name: "Brian Wooten",
    role: "Town Cafe",
    initials: "BW",
    image: "/images/brian.jpg",
  },
] as const;

export const STATS = [
  { value: "60+", label: "Projects shipped" },
  { value: "100%", label: "Hand-coded" },
  { value: "2018", label: "Serving Upstate SC" },
] as const;

export const PROJECT_TYPES = [
  "New website",
  "Hosting",
  "Redesign",
  "Smart technology",
  "Not sure yet",
] as const;
