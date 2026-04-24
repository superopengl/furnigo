import type { ThemeConfig } from "antd";

export const colors = {
  primary: "#3D3228",
  secondary: "#C4713B",
  accent: "#B8963E",
  background: "#FAF8F5",
  surface: "#F0EBE3",
  text: "#2C2420",
  textSecondary: "#8C7E72",
  border: "#E0D8CE",
  error: "#C04B3A",
  white: "#FFFFFF",
} as const;

export const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorError: colors.error,
    colorBgBase: colors.background,
    colorTextBase: colors.text,
    colorBorder: colors.border,
    colorBgContainer: colors.white,
    borderRadius: 12,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: colors.primary,
      algorithm: true,
    },
    Input: {
      borderRadius: 12,
    },
    Card: {
      borderRadius: 16,
    },
    Drawer: {
      borderRadius: 0,
    },
  },
};
