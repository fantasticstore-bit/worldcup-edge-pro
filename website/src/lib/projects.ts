import {
  BarChart3,
  Boxes,
  Globe2,
  LucideIcon,
  Route,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy
} from "lucide-react";

export type ProjectStatus = "In development" | "Coming soon" | "MVP";

export type Project = {
  slug: string;
  name: string;
  eyebrow: string;
  oneLiner: string;
  description: string;
  status: ProjectStatus;
  market: string;
  stage: string;
  nextMilestone: string;
  icon: LucideIcon;
  accent: "green" | "blue" | "mixed";
  landing: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    metrics: string[];
    features: {
      title: string;
      description: string;
      icon: LucideIcon;
    }[];
    buildFocus: string[];
    audience: string;
    proof: string;
  };
};

export const projects: Project[] = [
  {
    slug: "lego-tracker",
    name: "LEGO Tracker",
    eyebrow: "Alternative assets",
    oneLiner:
      "A portfolio and market cockpit for LEGO collectors, resellers and investors.",
    description:
      "Track LEGO set prices, portfolio value, pulse scores, retirement signals and buy targets.",
    status: "In development",
    market: "Collectors, resellers, alternative-asset investors",
    stage: "Working private prototype",
    nextMilestone: "Private beta access",
    icon: Boxes,
    accent: "green",
    landing: {
      headline: "A private investment cockpit for LEGO collectors.",
      subheadline:
        "LEGO Tracker turns collection data, market prices, API sync, pulse scores and watchlist targets into one decision center for what to buy, hold or sell.",
      primaryCta: "Request private beta access",
      metrics: ["Pulse score", "Portfolio gain", "Buy targets"],
      audience:
        "Built for collectors, resellers and LEGO investors who want a cleaner answer than scattered marketplace tabs, BrickLink checks and gut feeling.",
      proof:
        "The working prototype already includes account login, portfolio tracking, watchlists, API sync, hot-set filters, momentum views and a set-level decision center.",
      features: [
        {
          title: "Portfolio intelligence",
          description:
            "Track owned sets, quantities, paid price, estimated market value and gain across a real collection.",
          icon: BarChart3
        },
        {
          title: "Decision center",
          description:
            "Open a set and see badges, data source, verdict, liquidity, sealed premium and operational guidance.",
          icon: Timer
        },
        {
          title: "Watchlist targets",
          description:
            "Search by set or code, define target prices and monitor distance from buy zones.",
          icon: Sparkles
        }
      ],
      buildFocus: [
        "Real portfolio value and gain tracking",
        "Pulse score, momentum and hot-set filtering",
        "Buy/hold/watch verdicts at set level"
      ]
    }
  },
  {
    slug: "geofleet-ai",
    name: "GeoFleet AI",
    eyebrow: "Logistics intelligence",
    oneLiner: "Predictive operations for fleets, routes and delivery risk.",
    description:
      "Predict route completion times, delivery risks and driver performance.",
    status: "Coming soon",
    market: "Logistics operators, dispatch teams, delivery fleets",
    stage: "Concept and data model",
    nextMilestone: "Route-risk prototype",
    icon: Route,
    accent: "blue",
    landing: {
      headline: "Predict delivery risk before the route breaks.",
      subheadline:
        "GeoFleet AI turns operational data into route completion forecasts, driver performance patterns and exception alerts.",
      primaryCta: "Get GeoFleet AI updates",
      metrics: ["ETA prediction", "Risk scoring", "Driver insights"],
      audience:
        "Built for logistics teams that need calmer planning, earlier intervention and sharper route visibility.",
      proof:
        "Focused on practical dispatch decisions: which routes are drifting, where delays are compounding, and which interventions matter now.",
      features: [
        {
          title: "Completion forecasts",
          description:
            "Estimate route finish times using delivery density, territory, time windows and live progress.",
          icon: Timer
        },
        {
          title: "Risk detection",
          description:
            "Surface late-route exposure, missed-window probability and operational bottlenecks.",
          icon: ShieldCheck
        },
        {
          title: "Performance patterns",
          description:
            "Understand driver consistency, territory difficulty and day-to-day execution signals.",
          icon: BarChart3
        }
      ],
      buildFocus: [
        "Route completion forecasts",
        "Late-window and exception risk",
        "Driver and territory performance patterns"
      ]
    }
  },
  {
    slug: "world-cup-ai-model",
    name: "World Cup AI Model",
    eyebrow: "Football analytics",
    oneLiner: "Explainable football forecasting for World Cup 2026.",
    description:
      "AI-powered football analytics and prediction engine for World Cup 2026.",
    status: "MVP",
    market: "Football analysts, disciplined bettors, sports data builders",
    stage: "Live MVP",
    nextMilestone: "Public demo and model notes",
    icon: Trophy,
    accent: "mixed",
    landing: {
      headline: "An AI model for World Cup 2026 decisions.",
      subheadline:
        "Blend team strength, market odds, confidence scoring and model diagnostics into a clean football analytics cockpit.",
      primaryCta: "Follow the model",
      metrics: ["Team ratings", "Value signals", "Match forecasts"],
      audience:
        "Built for football analysts and disciplined bettors who want explainable model signals, not noisy hype.",
      proof:
        "The MVP emphasizes transparent assumptions, confidence bands and responsible analytics workflows.",
      features: [
        {
          title: "Prediction engine",
          description:
            "Generate match probabilities and compare model prices against available market odds.",
          icon: Globe2
        },
        {
          title: "Value shortlist",
          description:
            "Rank opportunities by edge, confidence, grade and risk notes for faster review.",
          icon: Sparkles
        },
        {
          title: "Performance lab",
          description:
            "Track results, ROI, price movement and model quality across the tournament.",
          icon: BarChart3
        }
      ],
      buildFocus: [
        "Team strength and match probabilities",
        "Value shortlist with confidence notes",
        "Performance tracking and model diagnostics"
      ]
    }
  },
  {
    slug: "power-bi-templates",
    name: "Power BI Templates",
    eyebrow: "Analytics assets",
    oneLiner: "Polished dashboard systems for operators who move fast.",
    description:
      "Ready-to-use dashboards for finance, logistics and personal management.",
    status: "Coming soon",
    market: "Founders, analysts, finance and operations teams",
    stage: "Template architecture",
    nextMilestone: "First template pack",
    icon: BarChart3,
    accent: "green",
    landing: {
      headline: "Premium Power BI dashboards without the blank canvas.",
      subheadline:
        "Launch polished, practical dashboards for finance, logistics and personal management with reusable template systems.",
      primaryCta: "Get template updates",
      metrics: ["Finance dashboards", "Logistics views", "Personal systems"],
      audience:
        "Built for operators, founders and analysts who want clean reporting foundations they can adapt quickly.",
      proof:
        "Templates are designed to be clear, reusable and presentation-ready, with layouts that support real review meetings.",
      features: [
        {
          title: "Executive-ready layouts",
          description:
            "Use structured pages for KPIs, trends, variance, performance and drill-down analysis.",
          icon: BarChart3
        },
        {
          title: "Reusable data model",
          description:
            "Start from opinionated models that can be adapted across different business contexts.",
          icon: Boxes
        },
        {
          title: "Polished delivery",
          description:
            "Get dashboard systems that look credible in front of clients, teams and investors.",
          icon: Sparkles
        }
      ],
      buildFocus: [
        "Executive KPI layouts",
        "Reusable semantic models",
        "Presentation-ready dashboard packs"
      ]
    }
  }
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
