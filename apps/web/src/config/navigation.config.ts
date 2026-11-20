// One navigation tree drives every nav surface (PRD 3.4). Adding a page: add its route file,
// then add a node here whose `key` matches the route's static data key.
import type { IconKey } from "../shell/nav-icons";
import type { MessageKey } from "../i18n";
import type { Role } from "../session";

export interface NavNode {
  key: string;
  /** Target path; empty for groups. */
  path: string;
  titleKey: MessageKey;
  /** Optional second line under a sub-item in the secondary panel. */
  descriptionKey?: MessageKey;
  icon: IconKey;
  /** `title` is an organizational heading, `collapse` opens a secondary panel. */
  type: "item" | "collapse" | "title";
  /** Empty means any signed-in user. */
  authority: Role[];
  subMenu: NavNode[];
}

export const navigationConfig: NavNode[] = [
  {
    key: "home",
    path: "/",
    titleKey: "nav.home",
    icon: "overview",
    type: "item",
    authority: [],
    subMenu: [],
  },
];

/** The top-level node that is, or contains, the item with this key. */
export function findTopLevel(tree: NavNode[], key: string | undefined): NavNode | undefined {
  if (!key) return undefined;
  const flat = tree.flatMap((n) => (n.type === "title" ? n.subMenu : [n]));
  return flat.find((n) => n.key === key || n.subMenu.some((s) => s.key === key));
}
