export function ScreenSaver() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <div className="animate-screen-saver absolute -inset-y-[10%] left-0 w-2/5 bg-[linear-gradient(90deg,rgba(150,230,255,0)_0%,rgba(150,230,255,0.06)_18%,rgba(255,180,220,0.22)_30%,rgba(255,230,160,0.5)_42%,rgba(180,255,200,0.7)_50%,rgba(210,180,255,0.5)_58%,rgba(180,210,255,0.22)_70%,rgba(180,210,255,0.06)_82%,rgba(180,210,255,0)_100%)] blur-2xl" />
    </div>
  );
}
