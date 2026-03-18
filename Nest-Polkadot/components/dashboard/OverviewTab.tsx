'use client'

import { motion } from 'framer-motion'
import { formatCurrency, calculateProgress, getDaysLeft } from '@/lib/utils'

const mockGoals = [
  { id: 1, name: 'Q3 Payroll', emoji: '💰', target: 50000, saved: 35000, deadline: '2024-07-31', priority: 1 },
  { id: 2, name: 'Marketing Campaign', emoji: '📢', target: 25000, saved: 18000, deadline: '2024-08-15', priority: 2 },
  { id: 3, name: 'Office Rent', emoji: '🏢', target: 15000, saved: 15000, deadline: '2024-07-01', priority: 3 },
]

const mockPayments = [
  { id: 1, payer: '0x742d...896f', amount: 10000, saved: 3000, liquid: 7000, token: 'USDC', timestamp: '2 hours ago', txHash: '0x1234...abcd' },
  { id: 2, payer: '0x89ab...def0', amount: 5000, saved: 1500, liquid: 3500, token: 'USDC', timestamp: '5 hours ago', txHash: '0x5678...efgh' },
  { id: 3, payer: '0xcdef...1234', amount: 7500, saved: 2250, liquid: 5250, token: 'USDC', timestamp: '1 day ago', txHash: '0x9abc...def0' },
]

export default function OverviewTab() {
  const totalTreasury = 124500
  const vaultBalance = 89500
  const liquidReserve = 35000
  const monthlyYield = 840

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card border-polkadot-primary shadow-polkadot-glow"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Total Treasury Value</h2>
          <div className="text-sm text-text-secondary">Live on Polkadot Hub</div>
        </div>
        
        <div className="text-5xl font-bold mono-number text-polkadot-primary mb-4">
          {formatCurrency(totalTreasury)}
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-text-secondary text-sm mb-1">Vault Balance</div>
            <div className="text-2xl font-semibold mono-number text-text-primary">
              {formatCurrency(vaultBalance)}
            </div>
          </div>
          <div>
            <div className="text-text-secondary text-sm mb-1">Liquid Reserve</div>
            <div className="text-2xl font-semibold mono-number text-text-primary">
              {formatCurrency(liquidReserve)}
            </div>
          </div>
        </div>
        
        <div className="text-success font-medium">
          Earning {formatCurrency(monthlyYield)}/month at 6.2% APY
        </div>
      </motion.div>

      {/* Goal Progress Cards */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">Goal Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="polkadot-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-text-primary">{goal.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {formatCurrency(goal.saved)} of {formatCurrency(goal.target)}
                    </p>
                  </div>
                </div>
                {goal.saved >= goal.target && (
                  <div className="text-success text-lg">✓</div>
                )}
              </div>
              
              <div className="polkadot-progress h-2 mb-2">
                <div
                  className="polkadot-progress-bar"
                  style={{ width: `${calculateProgress(goal.saved, goal.target)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  {Math.round(calculateProgress(goal.saved, goal.target))}% complete
                </span>
                <span className={`${getDaysLeft(goal.deadline) <= 7 ? 'text-warning' : 'text-text-secondary'}`}>
                  {getDaysLeft(goal.deadline)} days left
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">Recent Payments</h3>
        <div className="polkadot-card">
          <div className="space-y-4">
            {mockPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium text-text-primary">
                        From {payment.payer}
                      </div>
                      <div className="text-sm text-text-secondary">{payment.timestamp}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="mono-number font-semibold text-text-primary">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {formatCurrency(payment.saved)} saved · {formatCurrency(payment.liquid)} liquid
                    </div>
                  </div>
                  
                  <a
                    href={`https://blockscout.polkadot.io/tx/${payment.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-polkadot-primary hover:text-polkadot-hover text-sm font-mono"
                  >
                    {payment.txHash.slice(0, 10)}...{payment.txHash.slice(-8)}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Yield Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Yield Earned</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-text-secondary text-sm mb-1">This Month</div>
            <div className="text-2xl font-bold mono-number text-success">
              {formatCurrency(210.40)}
            </div>
          </div>
          <div>
            <div className="text-text-secondary text-sm mb-1">This Year</div>
            <div className="text-2xl font-bold mono-number text-text-primary">
              {formatCurrency(840.20)}
            </div>
          </div>
          <div>
            <div className="text-text-secondary text-sm mb-1">All Time</div>
            <div className="text-2xl font-bold mono-number text-text-primary">
              {formatCurrency(1204.80)}
            </div>
          </div>
        </div>
        
        {/* Mini Chart */}
        <div className="mt-6 h-16 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-polkadot-primary rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
