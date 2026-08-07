import "./Loading.css";

type LoadingProps = {
  text?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * ASCII 终端风加载态：绿色光标块脉冲，黑底等宽字体。
 *
 * 加载是最常出现的界面（配置初始化、路由懒加载），首屏必须与终端风一致，
 * 避免旧主题的衬线/暖金 spinner 闪现。
 *
 * 此组件刻意保持纯组件（无 useLocale）：ConfigProvider 自身在初始化期间会渲染它，
 * 那时尚无 locale 上下文，故文案只能由调用方通过 text prop 传入。
 */
const Loading = ({ text, children, className }: LoadingProps) => {
  return (
    <div
      className={`flex items-center justify-center flex-col w-full h-full ${
        className || ""
      }`}>
      <div className="ascii-loader" aria-label="Loading" role="status" />
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
