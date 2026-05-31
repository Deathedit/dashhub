import { useApp } from "@/app-context";
import { GlassCtx } from "@/lib/glass";

export function GlassProvider({ children }: { children: React.ReactNode }) {
  const { animatedBg, darkMode } = useApp();
  const isGlass = animatedBg === "matrix" && darkMode;

  return (
    <GlassCtx.Provider value={isGlass}>
      <div className={isGlass ? "glass" : ""}>
        {children}
      </div>
    </GlassCtx.Provider>
  );
}
