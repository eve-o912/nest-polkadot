'use client'

import { motion } from 'framer-motion'
import PolkadotDot from '@/components/PolkadotDot'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center px-4">
      {/* Animated Polkadot Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <PolkadotDot size="xl" />
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-6 leading-tight">
          Your business treasury,
          <br />
          <span className="text-polkadot-primary text-shadow-glow">working 24/7</span>
        </h1>

        <p className="text-xl md:text-2xl text-text-secondary mb-8">
          AI-powered stablecoin savings on Polkadot
        </p>

        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="polkadot-button text-lg px-8 py-4"
          >
            Connect your treasury →
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16"
      >
        <div className="text-center">
          <div className="mono-number text-3xl md:text-4xl font-bold mb-2">$2.4M</div>
          <div className="text-text-secondary text-sm uppercase tracking-wider">Saved</div>
        </div>
        <div className="text-center">
          <div className="mono-number text-3xl md:text-4xl font-bold mb-2">847</div>
          <div className="text-text-secondary text-sm uppercase tracking-wider">Businesses</div>
        </div>
        <div className="text-center">
          <div className="mono-number text-3xl md:text-4xl font-bold mb-2">6.2%</div>
          <div className="text-text-secondary text-sm uppercase tracking-wider">Avg APY</div>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-polkadot-glow rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-polkadot-glow rounded-full blur-3xl opacity-20" />
      </div>
    </div>
  )
}
