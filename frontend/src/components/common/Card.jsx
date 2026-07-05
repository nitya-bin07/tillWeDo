/**
 * Quiet, bordered surface. No colour, no gradient — the restraint itself
 * is the signature. Generous padding does the work decoration used to.
 */
export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`rounded-sm border border-line bg-paper-raised ${className}`}
    >
      <div className={padded ? 'p-10' : ''}>{children}</div>
    </div>
  );
}
