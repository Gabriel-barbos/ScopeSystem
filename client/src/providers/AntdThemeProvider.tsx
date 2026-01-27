import { ConfigProvider, theme as antdTheme } from "antd";
import { ReactNode, useEffect, useState } from "react";

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

interface AntdThemeProviderProps {
  children: ReactNode;
}

// Função para converter HSL CSS var para RGB
const hslToRgb = (hslString: string): string => {
  // Extrai os valores HSL da string "hsl(var(--variable))"
  const computedStyle = getComputedStyle(document.documentElement);
  const hslValue = computedStyle.getPropertyValue(
    hslString.replace("hsl(var(", "").replace("))", "")
  ).trim();
  
  const [h, s, l] = hslValue.split(" ").map(v => parseFloat(v));
  
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  
  let r, g, b;
  
  if (sDecimal === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = lDecimal < 0.5 
      ? lDecimal * (1 + sDecimal) 
      : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    
    r = hue2rgb(p, q, hDecimal + 1/3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export function AntdThemeProvider({ children }: AntdThemeProviderProps) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Converte as cores HSL para hex em tempo real
  const getColors = () => {
    try {
      return {
        background: hslToRgb("hsl(var(--background))"),
        foreground: hslToRgb("hsl(var(--foreground))"),
        border: hslToRgb("hsl(var(--border))"),
        primary: hslToRgb("hsl(var(--primary))"),
        muted: hslToRgb("hsl(var(--muted))"),
        accent: hslToRgb("hsl(var(--accent))"),
        card: hslToRgb("hsl(var(--card))"),
        popover: hslToRgb("hsl(var(--popover))"),
        input: hslToRgb("hsl(var(--input))"),
        secondary: hslToRgb("hsl(var(--secondary))"),
      };
    } catch (error) {
      // Fallback para cores padrão se houver erro
      return {
        background: isDark ? "#141b24" : "#fafafa",
        foreground: isDark ? "#e8eaed" : "#1a2332",
        border: isDark ? "#2d3748" : "#e0e0e0",
        primary: isDark ? "#3b82f6" : "#0066ff",
        muted: isDark ? "#232b36" : "#f0f0f0",
        accent: isDark ? "#2d3748" : "#eff6ff",
        card: isDark ? "#1a2332" : "#ffffff",
        popover: isDark ? "#1a2332" : "#ffffff",
        input: isDark ? "#2d3748" : "#e0e0e0",
        secondary: isDark ? "#2d3748" : "#e8eaed",
      };
    }
  };

  const colors = getColors();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorBgBase: colors.background,
          colorTextBase: colors.foreground,
          colorBorder: colors.border,
          colorPrimary: colors.primary,
          colorPrimaryHover: colors.primary,
          colorPrimaryActive: colors.primary,
          borderRadius: 8,
        },
        components: {
          Table: {
            headerBg: colors.muted,
            headerColor: colors.foreground,
            rowHoverBg: colors.accent,
            borderColor: colors.border,
            bodySortBg: colors.muted,
            colorBgContainer: colors.card,
          },
          Pagination: {
            itemBg: colors.card,
            itemActiveBg: colors.primary,
            itemLinkBg: "transparent",
          },
          Select: {
            optionSelectedBg: colors.accent,
            optionActiveBg: colors.muted,
            colorBgContainer: colors.input,
            colorBorder: colors.border,
          },
          Dropdown: {
            colorBgElevated: colors.popover,
            colorBorder: colors.border,
          },
          DatePicker: {
            colorBgContainer: colors.input,
            colorBorder: colors.border,
          },
          Input: {
            colorBgContainer: colors.input,
            colorBorder: colors.border,
          },
          Button: {
            colorBgContainer: colors.secondary,
            colorText: colors.foreground,
            colorBorder: colors.border,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}