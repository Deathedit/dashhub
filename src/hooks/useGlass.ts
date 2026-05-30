import { useApp } from "../App";

export function useGlass() {
  const { animatedBg } = useApp();
  const g = animatedBg === "matrix";
  return {
    card: g ? "bg-white/75 backdrop-blur-md dark:bg-gray-900/75" : "bg-white dark:bg-gray-900",
    cardSubtle: g ? "bg-gray-50/75 backdrop-blur-sm dark:bg-gray-800/60" : "bg-gray-50 dark:bg-gray-800/50",
    sidebar: g ? "bg-white/80 backdrop-blur-xl dark:bg-gray-900/80" : "bg-white dark:bg-gray-900",
    header: g ? "bg-white/80 backdrop-blur-xl dark:bg-gray-900/80" : "bg-white dark:bg-gray-900",
  };
}