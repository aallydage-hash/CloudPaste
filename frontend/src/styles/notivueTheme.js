/**
 * CloudPaste Notivue 主题配置
 * 基于 pastelTheme，仅自定义颜色
 */

import { pastelTheme, darkTheme } from "notivue";

/**
 * 亮色主题 - 基于 pastel
 */
export const cloudPasteLightTheme = {
  ...pastelTheme,

  // ===== Success - 绿色系 =====
  "--nv-success-accent": "#10b981",
  "--nv-success-border": "#d1fae5",

  // ===== Error - 红色系 =====
  "--nv-error-accent": "#dc2626",
  "--nv-error-border": "#fecaca",

  // ===== Warning - 黄色系 =====
  "--nv-warning-accent": "#f59e0b",
  "--nv-warning-border": "#fde68a",

  // ===== Info - 蓝色系 =====
  "--nv-info-accent": "#3b82f6",
  "--nv-info-border": "#bfdbfe",

  // ===== Promise/Loading - 紫色系 =====
  "--nv-promise-accent": "#8b5cf6",
  "--nv-promise-border": "#ddd6fe",
};

/**
 * 暗色主题 - 仅颜色自定义
 */
export const cloudPasteDarkTheme = {
  ...darkTheme,

  // ===== 暗色背景适配 =====
  "--nv-global-bg": "#0f1011",
  "--nv-global-fg": "#f7f8f8",
  "--nv-global-border": "rgba(255, 255, 255, 0.08)",

  // ===== Success - 绿色系 =====
  "--nv-success-accent": "#10b981",
  "--nv-success-bg": "#191a1b",
  "--nv-success-fg": "#f7f8f8",
  "--nv-success-border": "rgba(16, 185, 129, 0.2)",

  // ===== Error - 红色系 =====
  "--nv-error-accent": "#ef4444",
  "--nv-error-bg": "#191a1b",
  "--nv-error-fg": "#f7f8f8",
  "--nv-error-border": "rgba(239, 68, 68, 0.2)",

  // ===== Warning - 黄色系 =====
  "--nv-warning-accent": "#f59e0b",
  "--nv-warning-bg": "#191a1b",
  "--nv-warning-fg": "#f7f8f8",
  "--nv-warning-border": "rgba(245, 158, 11, 0.2)",

  // ===== Info - 蓝色系 =====
  "--nv-info-accent": "#3b82f6",
  "--nv-info-bg": "#191a1b",
  "--nv-info-fg": "#f7f8f8",
  "--nv-info-border": "rgba(59, 130, 246, 0.2)",

  // ===== Promise/Loading - 紫色系 =====
  "--nv-promise-accent": "#8b5cf6",
  "--nv-promise-bg": "#191a1b",
  "--nv-promise-fg": "#f7f8f8",
  "--nv-promise-border": "rgba(139, 92, 246, 0.2)",
};
