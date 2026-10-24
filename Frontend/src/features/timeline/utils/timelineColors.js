/**
 * Utility: timelineColors.js
 * Layer: features/timeline/utils/
 * Responsibility: Project-inherited color system for TeamSync Timeline.
 * Ensures every task bar strictly inherits its theme color from its parent project,
 * dynamically generates tints, borders, hover states, gradients, and guarantees
 * WCAG accessible text contrast.
 */

export const DEFAULT_PROJECT_COLOR = "#4361EE";
export const STANDALONE_TASK_COLOR = "#6366F1";

/**
 * Safely parse a hex color into { r, g, b } integers.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") {
    return { r: 67, g: 97, b: 238 }; // Default #4361EE
  }

  let clean = hex.replace("#", "").trim();

  // Support 3-digit hex e.g. #fff -> #ffffff
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (clean.length < 6) {
    return { r: 67, g: 97, b: 238 };
  }

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return {
    r: isNaN(r) ? 67 : r,
    g: isNaN(g) ? 97 : g,
    b: isNaN(b) ? 238 : b,
  };
}

/**
 * Slightly shifts RGB components for subtle gradient depth.
 */
function shiftColor(r, g, b, amount = -18) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  const hex = (v) => clamp(v).toString(16).padStart(2, "0");
  return `#${hex(r + amount)}${hex(g + amount)}${hex(b + amount)}`;
}

/**
 * Derive full color palette tokens from a base project color.
 */
export function deriveProjectColorTokens(baseColor) {
  const hex = baseColor && typeof baseColor === "string" ? baseColor : DEFAULT_PROJECT_COLOR;
  const { r, g, b } = hexToRgb(hex);

  // Perceived relative luminance for text contrast (ITU-R BT.601)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isLight = luminance > 0.65;

  const shifted = shiftColor(r, g, b, isLight ? -25 : -18);

  return {
    primary: hex,
    gradient: `linear-gradient(135deg, ${hex} 0%, ${shifted} 100%)`,
    bgLight: `rgba(${r}, ${g}, ${b}, 0.12)`,
    bgSubtle: `rgba(${r}, ${g}, ${b}, 0.08)`,
    bgMedium: `rgba(${r}, ${g}, ${b}, 0.22)`,
    bgHover: `rgba(${r}, ${g}, ${b}, 0.18)`,
    border: `rgba(${r}, ${g}, ${b}, 0.35)`,
    borderFocus: hex,
    glow: `0 4px 14px 0 rgba(${r}, ${g}, ${b}, 0.28)`,
    progressTrack: isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.22)",
    progressFill: isLight ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.35)",
    // Contrast text
    textColor: isLight ? "#0F172A" : "#FFFFFF",
    textSubtle: isLight ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.82)",
    avatarBorder: isLight ? "rgba(15, 23, 42, 0.25)" : "rgba(255, 255, 255, 0.4)",
    badgeBg: `rgba(${r}, ${g}, ${b}, 0.14)`,
    badgeText: isLight ? "#0F172A" : hex,
  };
}

/**
 * Resolves the theme color for any given task by looking up its associated project.
 * Adheres strictly to: task.project.themeColor -> timeline task bar color.
 *
 * @param {Object} task - The task object
 * @param {Array|Map} projects - Available projects array or map from useProjects()
 * @returns {string} Hex color string
 */
export function getTaskThemeColor(task, projects = []) {
  if (!task) return DEFAULT_PROJECT_COLOR;

  // 1. Check if task has a populated project object with themeColor or color
  if (task.project && typeof task.project === "object") {
    if (task.project.themeColor) return task.project.themeColor;
    if (task.project.color) return task.project.color;
  }

  // 2. Check if project ID is available and lookup in projects list
  const projectId =
    task.projectId ||
    (typeof task.project === "string" ? task.project : null) ||
    task.project?._id ||
    task.project?.id;

  if (projectId && Array.isArray(projects)) {
    const matched = projects.find(
      (p) => (p.id || p._id) === projectId || String(p._id) === String(projectId)
    );
    if (matched) {
      if (matched.themeColor) return matched.themeColor;
      if (matched.color) return matched.color;
    }
  }

  // 3. If individual task without a project, use cohesive individual task color
  if (task.isIndividual || task.projectName === "Individual Task" || !projectId) {
    return STANDALONE_TASK_COLOR;
  }

  // 4. Default fallback
  return DEFAULT_PROJECT_COLOR;
}
