import type { ComponentChildren } from "preact";

interface SectionFrameProps {
  eyebrow: string;
  title: string;
  icon?: ComponentChildren;
  children: ComponentChildren;
}

export function SectionFrame({
  eyebrow,
  title,
  icon,
  children,
}: SectionFrameProps) {
  return (
    <section className="section-frame">
      <header className="section-header">
        <div className="section-title-wrap">
          {icon ? <div className="section-icon">{icon}</div> : null}
          <div className="section-title-stack">
            {/* <div className="section-eyebrow">{eyebrow}</div> */}
            <div className="section-title">{title}</div>
          </div>
        </div>
      </header>
      <div className="section-content">{children}</div>
    </section>
  );
}
