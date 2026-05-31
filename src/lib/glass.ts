import { createContext, useContext } from "react";

export const GlassCtx = createContext(false);

export function useGlassActive() {
  return useContext(GlassCtx);
}

export function cardClass(isGlass: boolean) {
  return isGlass ? "bg-card/75 backdrop-blur-md border-card/50 glass-card" : "bg-card border-card";
}

export function sidebarClass(isGlass: boolean) {
  return isGlass ? "bg-sidebar/80 backdrop-blur-xl glass-sidebar" : "bg-sidebar border-sidebar";
}

export function subtleClass(isGlass: boolean) {
  return isGlass ? "bg-muted/60 backdrop-blur-sm" : "bg-muted";
}
