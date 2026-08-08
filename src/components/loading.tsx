import "./Loading.css";

type LoadingProps = {
  text?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * ASCII 终端风加载态：纯黑底，无光标无动画。
 *
 * 首屏 HTML 已有 "booting komari" 光标页，React 接管后到 dashboard 就绪前，
 * 此组件作为占位——保持纯黑，与 boot 页和 dashboard 无缝衔接，不再出现
 * 第二个跳动的光标。
 *
 * 此组件刻意保持纯组件（无 useLocale）：ConfigProvider 自身在初始化期间会渲染它，
 * 那时尚无 locale 上下文，故文案只能由调用方通过 text prop 传入。
 */
const Loading = ({ text, children, className }: LoadingProps) => {
  return (
    <div
      className={`flex items-center justify-center flex-col w-full h-full bg-[var(--ascii-background)] ${
        className || ""
      }`}>
      {text && (
        <p className="font-mono text-sm text-[var(--ascii-primary)] mt-4 tracking-wide">
          {text}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Loading;
