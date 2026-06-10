import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, TrendingUp, ShieldCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const steps = [
  { icon: Heart, title: 'Link with your partner', text: 'Invite your partner with a code and create your shared couple account.' },
  { icon: Lock, title: 'Save into the vault', text: 'Both partners contribute monthly. Funds stay locked and grow with interest.' },
  { icon: TrendingUp, title: 'Unlock when you marry', text: 'Submit marriage proof to release the vault — savings plus interest, together.' },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-light to-white px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
              Save Together. <span className="text-brand">Stay Together.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              TillWeDo is a shared savings vault for couples. Lock money away together, earn
              interest, and unlock it on your wedding day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        <section className="px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-ink">How it works</h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-light text-brand">
                  <s.icon size={24} />
                </div>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="bg-brand-light px-6 py-10 text-center">
          <p className="flex flex-wrap items-center justify-center gap-2 text-brand-dark">
            <ShieldCheck size={20} /> Secured payments via Razorpay · Funds held until your big day
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}