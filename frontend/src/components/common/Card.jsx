/**
 * Passbook-style card — the app's signature container.
 * A thin gold top rule stands in for a bank passbook's stamped edge;
 * everything else stays quiet so that rule does the talking.
 */
export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-line bg-paper-raised shadow-[0_1px_2px_rgba(36,28,27,0.04),0_8px_24px_-8px_rgba(36,28,27,0.10)] ${className}`}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-forest via-gold to-rosewood" />
      <div className={padded ? 'p-8' : ''}>{children}</div>
    </div>
  );
}
