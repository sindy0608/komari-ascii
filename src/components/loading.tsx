import "./Loading.css";

type LoadingProps = {
  text?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Serif 设计系统加载态。
 *
 * 用克制的三点脉冲替代原蓝色 material spinner——后者与象牙/暖金调色板冲突，
 * 破坏编辑式氛围。加载是最常出现的界面（配置初始化、路由懒加载、图表懒加载），
 * 必须在视觉上忠于设计系统。
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
      <div className="serif-loader" aria-label="Loading" role="status">
        <span />
        <span />
        <span />
      </div>
      {text && (
        <p className="serif-body text-sm text-secondary-foreground mt-4 tracking-wide">
          {text}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Loading;
