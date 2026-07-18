export function HUDCorners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/40 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold/40 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold/40 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/40 pointer-events-none" />
    </>
  );
}
