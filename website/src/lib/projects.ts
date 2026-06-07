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
  description: string;
  status: ProjectStatus;
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
    audience: string;
    proof: string;
  };
};

export const projects: Project[] = [
  {
    slug: "lego-tracker",
    name: "LEGO Tracker",
    eyebrow: "Alternative assets",
    description:
      "Track LEGO set prices, ROI, retirement dates and investment opportunities.",
    status: "In development",
    icon: Boxes,
    accent: "green",
    landing: {
      headline: "A smarter command center for LEGO investing.",
      subheadline:
        "Monitor collectible set values, retirement windows, market velocity and ROI signals from one premium dashboard.",
      primaryCta: "Join LEGO Tracker updates",
      metrics: ["ROI watchlists", "Retirement signals", "Price history"],
      audience:
        "Built for collectors, resellers and alternative-asset investors who want to make decisions with data instead of scattered marketplace tabs.",
      proof:
        "Designed around repeatable investment workflows: shortlist, track, compare, time entry, and monitor exits.",
      features: [
        {
          title: "Portfolio tracking",
          description:
            "Organize owned sets, target prices, acquisition cost and estimated upside in one live view.",
          icon: BarChart3
        },
        {
          title: "Retirement intelligence",
          description:
            "Prioritize sets nearing retirement and identify categories with stronger scarcity potential.",
          icon: Timer
        },
        {
          title: "Opportunity scoring",
          description:
            "Compare ROI, liquidity and risk signals before committing capital to a set.",
          icon: Sparkles
        }
      ]
    }
  },
  {
    slug: "geofleet-ai",
    name: "GeoFleet AI",
    eyebrow: "Logistics intelligence",
    description:
      "Predict route completion times, delivery risks and driver performance.",
    status: "Coming soon",
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
      ]
    }
  },
  {
    slug: "world-cup-ai-model",
    name: "World Cup AI Model",
    eyebrow: "Football analytics",
    description:
      "AI-powered football analytics and prediction engine for World Cup 2026.",
    status: "MVP",
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
      ]
    }
  },
  {
    slug: "power-bi-templates",
    name: "Power BI Templates",
    eyebrow: "Analytics assets",
    description:
      "Ready-to-use dashboards for finance, logistics and personal management.",
    status: "Coming soon",
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
      ]
    }
  }
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
