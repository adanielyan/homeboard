import type { ComponentChildren } from "preact";

interface SectionFrameProps {
  eyebrow: string;
  title: string;
  icon?: ComponentChildren;
  children: ComponentChildren;
}

export const sectionPanelClassName =
  "relative grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-[rgba(124,158,224,0.2)] bg-[linear-gradient(180deg,rgba(11,22,40,0.92)_0%,rgba(8,16,29,0.96)_100%)] p-[clamp(14px,1vw,20px)] shadow-board-panel max-[1500px]:p-4 [@media(max-height:980px)]:p-4";

export function SectionFrame({
  eyebrow: _eyebrow,
  title,
  icon,
  children,
}: SectionFrameProps) {
  return (
    <section className={sectionPanelClassName}>
      <header className="mb-[clamp(10px,0.8vw,16px)]">
        <div className="flex items-center gap-[0.9rem]">
          {icon ? (
            <div className="grid size-[1.8rem] place-items-center text-[#76b8ff]/92 [&_svg]:size-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
              {icon}
            </div>
          ) : null}
          <div>
            <div className="text-[clamp(1.1rem,1.35vw,1.5rem)] font-semibold">
              {title}
            </div>
          </div>
        </div>
      </header>
      <div className="relative z-[1] min-h-0">{children}</div>
    </section>
  );
}
