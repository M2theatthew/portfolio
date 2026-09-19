import {
  ChartNoAxesCombined,
  Church,
  Cloud,
  CodeXml,
  Hammer,
  House,
  Presentation,
  Store,
  TreePine,
  Utensils,
  Wifi,
} from "lucide-react";
import type { PinIcon } from "@/lib/site-data";

const ICONS = {
  home: House,
  // Line-over-bars glyph — matches the trend/bars icon in the map pin reference.
  chart: ChartNoAxesCombined,
  cloud: Cloud,
  wifi: Wifi,
  utensils: Utensils,
  tree: TreePine,
  church: Church,
  store: Store,
  hammer: Hammer,
  code: CodeXml,
  board: Presentation,
} as const;

export function PinGlyph({
  name,
  className,
  solid = false,
}: {
  name: PinIcon;
  className?: string;
  /** Fills the house glyph in (the reference's home pin is a solid house). */
  solid?: boolean;
}) {
  const Icon = ICONS[name];
  return (
    <Icon
      className={className}
      strokeWidth={2.2}
      fill={solid && name === "home" ? "currentColor" : "none"}
    />
  );
}
