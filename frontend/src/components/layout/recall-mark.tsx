/** Sharp, engineered brand mark — a blue square with an offset cut-out block. */
export function RecallMark(): JSX.Element {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center bg-primary" aria-hidden="true">
      <span className="absolute right-1 top-1 h-2 w-2 bg-white" />
      <span className="absolute bottom-1 left-1 h-2 w-2 bg-white/45" />
    </span>
  );
}
