"use client";

import * as React from "react";
import { AppThemeProvider } from "./app-theme-provider";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from "next-auth/react";

export function ClientProviders({ children }: ThemeProviderProps) {
  return (
    <AppThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>{children}</SessionProvider>
    </AppThemeProvider>
  );
}
