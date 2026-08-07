import { type ReactNode, useEffect, useState, useMemo } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions, type SiteStatus } from "./default";
import { apiService, getWsService } from "@/services/api";
import Loading from "@/components/loading";
import { defaultTexts, otherTexts } from "./locales";
import { mergeTexts, deepMerge } from "@/utils/localeUtils";

// 配置提供者属性类型
interface ConfigProviderProps {
  children: ReactNode;
}

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [publicSettings, setPublicSettings] = useState<PublicInfo | null>(null);
  const [config, setConfig] = useState<ConfigOptions | null>(null);
  const [siteStatus, setSiteStatus] = useState<SiteStatus>("public");
  const [previewConfig, setPreviewConfig] =
    useState<Partial<ConfigOptions> | null>(null);

  const loadConfig = async () => {
    try {
      const { status, publicInfo } = await apiService.checkSiteStatus();
      setSiteStatus(status);
      setPublicSettings(publicInfo);

      let mergedConfig: ConfigOptions;
      if (publicInfo) {
        const themeSettings =
          (publicInfo.theme_settings as ConfigOptions) || {};
        mergedConfig = {
          ...DEFAULT_CONFIG,
          ...themeSettings,
          titleText:
            themeSettings.titleText ||
            publicInfo.sitename ||
            DEFAULT_CONFIG.titleText,
        };
      } else {
        mergedConfig = DEFAULT_CONFIG;
      }
      setConfig(mergedConfig);

      // Initialize RPC
      if (mergedConfig.enableJsonRPC2Api) {
        const versionInfo = await apiService.getVersion();
        if (versionInfo && versionInfo.version) {
          const match = versionInfo.version.match(/(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const [, major, minor, patch] = match.map(Number);
            if (
              major > 1 ||
              (major === 1 && minor > 0) ||
              (major === 1 && minor === 0 && patch >= 7)
            ) {
              apiService.useRpc = true;
              getWsService().useRpc = true;
              console.log("RPC has been enabled for API and WebSocket.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize site:", error);
      setConfig(DEFAULT_CONFIG);
      setSiteStatus("private-unauthenticated");
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const texts = useMemo(() => {
    const activeConfig = previewConfig
      ? { ...config, ...previewConfig }
      : config;
    const baseTexts = activeConfig?.customTexts
      ? mergeTexts(defaultTexts, activeConfig.customTexts)
      : defaultTexts;
    return deepMerge(baseTexts, otherTexts);
  }, [config, previewConfig]);

  const updatePreviewConfig = (newConfig: Partial<ConfigOptions>) => {
    setPreviewConfig(newConfig);
  };

  const reloadConfig = async () => {
    await loadConfig();
  };

  const activeConfig = useMemo(
    () =>
      previewConfig
        ? { ...(config || DEFAULT_CONFIG), ...previewConfig }
        : config || DEFAULT_CONFIG,
    [config, previewConfig]
  );

  if (!config) {
    // 仅在 React 挂载前（index.html 的黑底启动屏）与首请求返回前短暂出现；
    // 配置一到立即渲染主页，不再用 isLoaded 门控制造空白页。
    return <Loading />;
  }

  return (
    <ConfigContext.Provider
      value={{
        ...activeConfig,
        titleText: config?.titleText || DEFAULT_CONFIG.titleText,
        publicSettings,
        siteStatus,
        texts,
        previewConfig,
        updatePreviewConfig,
        reloadConfig,
      }}>
      {children}
    </ConfigContext.Provider>
  );
}
