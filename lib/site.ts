/** Single source of truth for the site's public URL and identity (metadata, robots, sitemap, JSON-LD). */
export const SITE_URL = "https://new-portfolio.ahmadbhanvadiya.workers.dev";

export const SITE = {
  name: "Ahmad Bhanvadiya",
  title: "Ahmad Bhanvadiya — Full-stack developer",
  description:
    "I build useful things with thoughtful engineering and a little cinematic chaos. Selected work by Ahmad Bhanvadiya.",
  shortDescription: "Selected experiments, products, and digital experiences.",
  jobTitle: "Full-stack developer",
  locality: "Hyderabad",
  country: "IN",
  github: "https://github.com/ahmadbhanvadiya-dot",
  linkedin: "https://linkedin.com/in/ahmad-bhanvadia-dot",
  colors: { paper: "#f1e8d2", ink: "#17202a", red: "#b52d32", gold: "#e9bf57" },
} as const;
