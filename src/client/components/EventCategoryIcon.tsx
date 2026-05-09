import {
  Bed,
  Briefcase,
  CalendarDays,
  Dumbbell,
  Film,
  type LucideIcon,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";

interface EventCategoryIconProps {
  title: string;
}

interface CategoryRule {
  pattern: RegExp;
  Icon: LucideIcon;
}

const RULES: ReadonlyArray<CategoryRule> = [
  { pattern: /\b(grocer|market|costco|trader|safeway|whole foods)\b/i, Icon: ShoppingBasket },
  { pattern: /\b(breakfast|brunch|lunch|dinner|supper|restaurant|eat)\b/i, Icon: UtensilsCrossed },
  { pattern: /\b(walk|run|jog|gym|workout|yoga|soccer|swim|bike|tennis)\b/i, Icon: Dumbbell },
  { pattern: /\b(team|standup|review|client|sync|1:1|meeting|interview|budget)\b/i, Icon: Briefcase },
  { pattern: /\b(movie|show|concert|theater|theatre|film|cinema|play)\b/i, Icon: Film },
  { pattern: /\b(bed|sleep|nap|bedtime)\b/i, Icon: Bed },
];

export function EventCategoryIcon({ title }: EventCategoryIconProps) {
  const Icon = RULES.find((rule) => rule.pattern.test(title))?.Icon ?? CalendarDays;
  return (
    <Icon
      className="size-full fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]"
      aria-hidden="true"
      strokeWidth={1.75}
    />
  );
}
