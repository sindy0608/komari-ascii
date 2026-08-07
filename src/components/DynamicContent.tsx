import { type ReactNode, useMemo } from "react";
import { useAppConfig } from "@/config/hooks";

// ASCII 终端风：原主题的壁纸/视频背景与淡入动画已随田园风一并移除，
// 此处只保留布局所需的 CSS 变量注入（主内容宽度、占位玻璃参数）。
export function DynamicContent({ children }: { children: ReactNode }) {
  const config = useAppConfig();

  const dynamicStyles = useMemo(() => {
    if (!config) return "";
    const { mainWidth, blurValue, blurBackgroundColor } = config;
    const styles: string[] = [];

    styles.push(`--main-width: ${mainWidth}vw;`);
    styles.push(`--purcarte-blur: ${blurValue}px;`);

    const colors = blurBackgroundColor.split("|").map((color) => color.trim());
    if (colors.length >= 2) {
      styles.push(`--card-light: ${colors[0]};`);
      styles.push(`--card-dark: ${colors[1]};`);
    } else if (colors.length === 1) {
      styles.push(`--card-light: ${colors[0]};`);
      styles.push(`--card-dark: ${colors[0]};`);
    }

    return `:root { ${styles.join(" ")} }`;
  }, [config]);

  return (
    <>
      <style>{dynamicStyles}</style>
      {children}
    </>
  );
}
