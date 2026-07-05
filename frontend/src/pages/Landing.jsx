import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Lock, Gem, ShieldCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const steps = [
  {
    icon: UserPlus,
    title: 'Link with your partner',
    text: 'Invite your partner with a code and create your shared couple account.',
  },
  {
    icon: Lock,
    title: 'Save into the vault',
    text: 'Both partners contribute monthly. Funds stay locked and grow with interest.',
  },
  {
    icon: Gem,
    title: 'Unlock when you marry',
    text: 'Submit marriage proof to release the vault — savings plus interest, together.',
  },
];

/** Signature motif: two contributions, kept as separate lines, converging
    into one balance — the whole idea of the product in one shape. */
function ConvergingLines() {
  return (
    <svg viewBox="0 0 480 200" className="mx-auto w-full max-w-md" aria-hidden="true">
      <path
        d="M 10 40 C 180 40, 260 100, 460 100"
        fill="none"
        stroke="var(--color-forest)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 10 160 C 180 160, 260 100, 460 100"
        fill="none"
        stroke="var(--color-rosewood)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="10" cy="40" r="5" fill="var(--color-forest)" />
      <circle cx="10" cy="160" r="5" fill="var(--color-rosewood)" />
      <circle cx="460" cy="100" r="8" fill="var(--color-gold)" />
      <circle cx="460" cy="100" r="14" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pb-6 pt-16 text-center sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d16]">
              A savings vault for two
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.1] text-ink sm:text-6xl">
              Save together.
              <br />
              <span className="text-rosewood">Stay together.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink-soft">
              Two partners, two contributions, one vault — locked away, growing with interest,
              and released together on your wedding day.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button size="lg">Start your vault</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  Log in
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-14 max-w-lg"
          >
            <ConvergingLines />
            <div className="mt-1 flex justify-between px-1 font-mono text-xs text-ink-soft/70">
              <span>Partner A</span>
              <span className="text-[#8a6d16]">your vault</span>
              <span>Partner B</span>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">How it works</h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.title} className="text-center" padded={false}>
                <div className="p-6">
                  <p className="mb-3 font-mono text-xs text-ink-soft/60">0{i + 1}</p>
                  <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-rosewood-light text-rosewood">
                    <s.icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{s.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-line bg-forest-light px-6 py-8 text-center">
          <p className="flex flex-wrap items-center justify-center gap-2 font-medium text-forest">
            <ShieldCheck size={20} /> Secured payments via Razorpay · Funds held until your big day
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
