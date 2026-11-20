import { IconLayoutDashboard, type Icon } from "@tabler/icons-react";

// Map of icon keys to Tabler icons. Add a key here, then use it in navigation.config.
export const navIconConfig = { size: 20, strokeWidth: 1.5 } as const;

export const navigationIconMap = {
  overview: IconLayoutDashboard,
} satisfies Record<string, Icon>;

export type IconKey = keyof typeof navigationIconMap;

export function NavIcon({ icon }: { icon: IconKey }) {
  const Component = navigationIconMap[icon];
  return <Component size={navIconConfig.size} stroke={navIconConfig.strokeWidth} />;
}
