'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatTxHash, getExplorerUrl } from '@/lib/utils'

const mockPayments = [
  {
    id: 1,
    payer: '0x742d35Cc6634C0532925a3b8D4E9...',
    recipient: 'Your Business',
    amount: 10000,
    saved: 3000,
    liquid: 7000,
    token: 'USDC',
    fromParaId: null,
    txHash: '0x1234abcd5678efgh9012ijkl3456mnop7890',
    timestamp: '2024-06-18T14:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    payer: '0x89abCdef1234Ghij5678Klmn9012Opqr3456Stuv',
    recipient: 'Your Business',
    amount: 5000,
    saved: 1500,
    liquid: 3500,
    token: 'USDC',
    fromParaId: 1000,
    txHash: '0x5678efgh9012ijkl3456mnop7890qrst1234uvwx',
    timestamp: '2024-06-18T09:15:00Z',
    status: 'completed'
  },
  {
    id: 3,
    payer: '0xcdef1234Ghij5678Klmn9012Opqr3456Stuv7890',
    recipient: 'Your Business',
    amount: 7500,
    saved: 2250,
    liquid: 5250,
    token: 'USDC',
    fromParaId: null,
    txHash: '0x9abcd1234efgh5678ijkl9012mnop3456qrst7890',
    timestamp: '2024-06-17T16:45:00Z',
    status: 'completed'
  },
]

export default function PaymentsTab() {
  const [paymentLink, setPaymentLink] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)

  const generatePaymentLink = () => {
    const link = `https://nest-treasury.app/pay/${Math.random().toString(36).substr(2, 9)}`
    setPaymentLink(link)
    setShowLinkModal(true)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Payment Link Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Payment Links</h2>
            <p className="text-text-secondary">
              Generate links for clients to pay your business
            </p>
          </div>
          <button
            onClick={generatePaymentLink}
            className="polkadot-button"
          >
            Generate Link
          </button>
        </div>

        <div className="bg-surface-secondary rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-2">How it works:</h3>
          <ol className="space-y-2 text-text-secondary text-sm">
            <li>1. Generate a unique payment link</li>
            <li>2. Share it with your clients</li>
            <li>3. Client pays via NestPaySplitter contract</li>
            <li>4. Payment is automatically split per your policy</li>
            <li>5. Real-time on-chain transaction with verifiable hash</li>
          </ol>
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Payment History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">From</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Amount</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Saved</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Liquid</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">Chain</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Transaction</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-border hover:bg-surface-secondary transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-mono text-sm text-text-primary">
                        {payment.payer.slice(0, 10)}...{payment.payer.slice(-8)}
                      </div>
                      <div className="text-xs text-text-secondary">{payment.recipient}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="mono-number font-semibold text-text-primary">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-text-secondary">{payment.token}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="mono-number text-success">
                      {formatCurrency(payment.saved)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="mono-number text-text-primary">
                      {formatCurrency(payment.liquid)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {payment.fromParaId ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-polkadot-subtle rounded text-xs text-polkadot-primary">
                        Para #{payment.fromParaId}
                      </div>
                    ) : (
                      <div className="text-xs text-text-secondary">Polkadot Hub</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={getExplorerUrl(payment.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-polkadot-primary hover:text-polkadot-hover"
                    >
                      {formatTxHash(payment.txHash)}
                    </a>
                  </td>
                  <td className="py-4 px-4 text-sm text-text-secondary">
                    {formatDate(payment.timestamp)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Payment Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold mono-number text-polkadot-primary">
              {mockPayments.length}
            </div>
            <div className="text-sm text-text-secondary">Total Payments</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-text-primary">
              {formatCurrency(mockPayments.reduce((sum, p) => sum + p.amount, 0))}
            </div>
            <div className="text-sm text-text-secondary">Total Volume</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-success">
              {formatCurrency(mockPayments.reduce((sum, p) => sum + p.saved, 0))}
            </div>
            <div className="text-sm text-text-secondary">Total Saved</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-text-primary">
              30%
            </div>
            <div className="text-sm text-text-secondary">Average Save Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Payment Link Modal */}
      {showLinkModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowLinkModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="polkadot-card max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-text-primary mb-4">Payment Link Generated</h3>
            
            <div className="bg-surface-secondary rounded-lg p-4 mb-4">
              <div className="font-mono text-sm text-polkadot-primary break-all">
                {paymentLink}
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentLink)
                  alert('Link copied to clipboard!')
                }}
                className="polkadot-button w-full"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowLinkModal(false)}
                className="polkadot-button-outline w-full"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
