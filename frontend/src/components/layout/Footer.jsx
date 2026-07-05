export default function Footer() {
  return (
    <footer className="border-t border-line px-8 py-10 text-center">
      <p className="font-display text-base italic text-ink">
        TillWeDo<span className="text-accent">.</span>
      </p>
      <p className="mt-1.5 text-xs text-ink-faint">
        Save together. Stay together. © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
