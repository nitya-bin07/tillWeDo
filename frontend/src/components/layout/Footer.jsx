export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-8 text-center">
      <p className="font-display text-sm text-ink-soft">
        <span className="text-rosewood">Till</span>
        <span className="text-forest">We</span>
        <span className="text-ink">Do</span>
      </p>
      <p className="mt-1 text-xs text-ink-soft/70">
        Save Together. Stay Together. © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
