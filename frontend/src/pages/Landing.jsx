import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const steps = [
  {
    n: '01',
    title: 'Link with your partner',
    text: 'Invite your partner with a code and create your shared couple account.',
  },
  {
    n: '02',
    title: 'Save into the vault',
    text: 'Both partners contribute monthly. Funds stay locked and grow with interest.',
  },
  {
    n: '03',
    title: 'Unlock when you marry',
    text: 'Submit marriage proof to release the vault — savings plus interest, together.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pb-24 pt-24 text-center sm:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-xl"
          >
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-ink-faint">
              A savings vault for two
            </p>
            <h1 className="font-display text-6xl font-normal leading-[1.08] text-ink sm:text-7xl">
              Save together.
              <br />
              <span className="italic text-accent">Stay together.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-sm text-base leading-relaxed text-ink-soft">
              Two contributions, one vault — locked away, growing with interest, released
              together on your wedding day.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
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
        </section>

        {/* How it works */}
        <section className="border-t border-line px-6 py-24">
          <div className="mx-auto max-w-2xl">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`flex gap-8 py-8 ${i !== 0 ? 'border-t border-line' : ''}`}
              >
                <span className="w-10 shrink-0 font-mono text-sm text-ink-faint">{s.n}</span>
                <div>
                  <h3 className="font-display text-xl font-normal text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-t border-line px-6 py-10 text-center">
          <p className="text-sm text-ink-soft">
            Secured payments via Razorpay · Funds held until your big day
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
