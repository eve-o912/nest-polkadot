'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, calculateProgress, getDaysLeft } from '@/lib/utils'

const mockGoals = [
  { 
    id: 1, 
    name: 'Q3 Payroll', 
    emoji: '💰', 
    target: 50000, 
    saved: 35000, 
    deadline: '2024-07-31', 
    priority: 1,
    status: 'active',
    onChainIndex: 0
  },
  { 
    id: 2, 
    name: 'Marketing Campaign', 
    emoji: '📢', 
    target: 25000, 
    saved: 18000, 
    deadline: '2024-08-15', 
    priority: 2,
    status: 'active',
    onChainIndex: 1
  },
  { 
    id: 3, 
    name: 'Office Rent', 
    emoji: '🏢', 
    target: 15000, 
    saved: 15000, 
    deadline: '2024-07-01', 
    priority: 3,
    status: 'completed',
    onChainIndex: 2
  },
  { 
    id: 4, 
    name: 'Equipment Upgrade', 
    emoji: '💻', 
    target: 30000, 
    saved: 8000, 
    deadline: '2024-09-30', 
    priority: 2,
    status: 'active',
    onChainIndex: 3
  },
]

export default function GoalsTab() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success'
      case 'active': return 'text-polkadot-primary'
      case 'paused': return 'text-warning'
      default: return 'text-text-secondary'
    }
  }

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 0) return 'text-error'
    if (daysLeft <= 7) return 'text-warning'
    return 'text-text-secondary'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Treasury Goals</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="polkadot-button"
        >
          Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="polkadot-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{goal.emoji}</span>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{goal.name}</h3>
                  <p className="text-sm text-text-secondary">
                    Priority {goal.priority} · On-chain index {goal.onChainIndex}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                {goal.status.toUpperCase()}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-primary font-medium">
                  {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
                </span>
                <span className="mono-number text-polkadot-primary">
                  {Math.round(calculateProgress(goal.saved, goal.target))}%
                </span>
              </div>
              <div className="polkadot-progress h-3">
                <div
                  className="polkadot-progress-bar"
                  style={{ width: `${calculateProgress(goal.saved, goal.target)}%` }}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Deadline</p>
                <p className={`font-medium ${getUrgencyColor(getDaysLeft(goal.deadline))}`}>
                  {getDaysLeft(goal.deadline)} days left
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Remaining</p>
                <p className="mono-number font-semibold text-text-primary">
                  {formatCurrency(goal.target - goal.saved)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 polkadot-button-outline text-sm py-2">
                Fund Goal
              </button>
              <button className="flex-1 border border-border text-text-secondary hover:text-text-primary py-2 rounded-lg text-sm transition-colors">
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goal Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Goal Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold mono-number text-polkadot-primary">
              {mockGoals.length}
            </div>
            <div className="text-sm text-text-secondary">Total Goals</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-success">
              {mockGoals.filter(g => g.status === 'completed').length}
            </div>
            <div className="text-sm text-text-secondary">Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-warning">
              {mockGoals.filter(g => getDaysLeft(g.deadline) <= 7).length}
            </div>
            <div className="text-sm text-text-secondary">Urgent (≤7 days)</div>
          </div>
          <div>
            <div className="text-3xl font-bold mono-number text-text-primary">
              {formatCurrency(mockGoals.reduce((sum, g) => sum + g.saved, 0))}
            </div>
            <div className="text-sm text-text-secondary">Total Saved</div>
          </div>
        </div>
      </motion.div>

      {/* Create Goal Modal (placeholder) */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="polkadot-card max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-text-primary mb-4">Create New Goal</h3>
            <p className="text-text-secondary mb-4">
              Goal creation will be implemented with on-chain transaction
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="polkadot-button w-full"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
