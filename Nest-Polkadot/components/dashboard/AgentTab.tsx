'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatTxHash, getExplorerUrl } from '@/lib/utils'

const mockAgentLogs = [
  {
    id: 1,
    tool: 'fund_goal',
    goalName: 'Q3 Payroll',
    amount: 2500,
    reason: 'Funding urgent payroll goal - 5 days to deadline',
    txHash: '0x1234...abcd',
    timestamp: '2 hours ago',
    status: 'executed'
  },
  {
    id: 2,
    tool: 'send_alert',
    message: 'Liquid reserve below minimum - consider rebalancing',
    urgency: 'high',
    timestamp: '5 hours ago',
    status: 'notified'
  },
  {
    id: 3,
    tool: 'fund_goal',
    goalName: 'Marketing Campaign',
    amount: 1500,
    reason: 'Regular funding based on priority',
    txHash: '0x5678...efgh',
    timestamp: '1 day ago',
    status: 'executed'
  },
  {
    id: 4,
    tool: 'generate_cfo_report',
    report: 'Monthly treasury performance summary generated',
    timestamp: '2 days ago',
    status: 'notified'
  },
]

export default function AgentTab() {
  const [autopilot, setAutopilot] = useState(false)
  const [liquidReserve, setLiquidReserve] = useState('10000')
  const [monthlyBudget, setMonthlyBudget] = useState('5000')
  const [autoSavePercent, setAutoSavePercent] = useState(20)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'text-success'
      case 'notified': return 'text-warning'
      case 'error': return 'text-error'
      default: return 'text-text-secondary'
    }
  }

  const getStatusIcon = (tool: string) => {
    switch (tool) {
      case 'fund_goal': return '🎯'
      case 'send_alert': return '📢'
      case 'generate_cfo_report': return '📊'
      default: return '⚙️'
    }
  }

  return (
    <div className="space-y-8">
      {/* Agent Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">AI Agent Status</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${autopilot ? 'bg-success' : 'bg-warning'}`} />
            <span className="text-text-secondary">
              {autopilot ? 'Autopilot' : 'Notify Only'}
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-text-primary">Agent Mode</h3>
            <p className="text-sm text-text-secondary">
              {autopilot 
                ? 'Agent will execute real transactions' 
                : 'Agent will only send notifications'
              }
            </p>
          </div>
          <button
            onClick={() => setAutopilot(!autopilot)}
            className={`w-16 h-8 rounded-full transition-colors duration-200 ${
              autopilot ? 'bg-polkadot-primary' : 'bg-surface-tertiary'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
              autopilot ? 'translate-x-9' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Policy Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">Policy Settings</h3>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Liquid Reserve (USDC)
            </label>
            <input
              type="number"
              value={liquidReserve}
              onChange={(e) => setLiquidReserve(e.target.value)}
              className="polkadot-input w-full"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Monthly Budget (USDC)
            </label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="polkadot-input w-full"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Auto-Save Percentage: {autoSavePercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={autoSavePercent}
              onChange={(e) => setAutoSavePercent(Number(e.target.value))}
              className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Run Agent Button */}
        <div className="mt-6 flex gap-4">
          <button className="polkadot-button">
            Run Agent Now
          </button>
          <button className="polkadot-button-outline">
            Test Mode
          </button>
        </div>
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Agent Activity Log</h3>
        
        <div className="space-y-4">
          {mockAgentLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-surface-secondary rounded-lg"
            >
              <div className="text-2xl">
                {getStatusIcon(log.tool)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium capitalize ${getStatusColor(log.status)}`}>
                    {log.tool.replace('_', ' ')} · {log.status}
                  </span>
                  <span className="text-sm text-text-secondary">{log.timestamp}</span>
                </div>
                
                <p className="text-text-primary mb-2">
                  {log.reason || log.message || log.report}
                </p>
                
                {log.amount && (
                  <div className="mono-number text-polkadot-primary">
                    {formatCurrency(log.amount)}
                  </div>
                )}
                
                {log.txHash && (
                  <a
                    href={getExplorerUrl(log.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-polkadot-primary hover:text-polkadot-hover text-sm font-mono"
                  >
                    {formatTxHash(log.txHash)}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Latest CFO Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="polkadot-card"
      >
        <h3 className="text-xl font-bold text-text-primary mb-4">Latest CFO Report</h3>
        
        <div className="bg-surface-secondary rounded-lg p-6">
          <h4 className="font-semibold text-text-primary mb-4">Monthly Treasury Summary</h4>
          
          <div className="space-y-3 text-text-secondary">
            <p>• Total treasury value increased by <span className="mono-number text-success">+$12,450</span> this month</p>
            <p>• Yield generated: <span className="mono-number text-polkadot-primary">$840.20</span> at 6.2% APY</p>
            <p>• 3 goals funded, <span className="mono-number text-warning">1 goal</span> requires immediate attention</p>
            <p>• Liquid reserve maintained above minimum threshold</p>
            <p>• Agent executed 12 transactions with 100% success rate</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Generated</span>
              <span className="text-text-primary">June 30, 2024</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
