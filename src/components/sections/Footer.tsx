import { forwardRef } from "react";

const Footer = forwardRef<HTMLElement, { isSettingsOpen: boolean }>(() => {
  // Serif 重设计：去除底部 "Powered by / Theme by" 归属信息。
  // 整个页脚原本仅承载该文本，故直接返回 null；footerHeight 测量已有 null 守卫。
  return null;
});

export default Footer;
