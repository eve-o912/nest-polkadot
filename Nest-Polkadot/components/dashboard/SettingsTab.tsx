'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatAddress } from '@/lib/utils'

export default function SettingsTab() {
  const [businessName, setBusinessName] = useState('Acme Corporation')
  const [walletAddress, setWalletAddress] = useState('0x742d35Cc6634C0532925a3b8D4E9...')
  const [notifications, setNotifications] = useState({
    payments: true,
    goals: true,
    agent: true,
    reports: false
  })

  return (
    <div className="space-y-8">
      {/* Business Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="polkadot-card"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Business Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="polkadot-input w-full"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Wallet Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="polkadot-input flex-1 font-mono"
                placeholder="0x..."
              />
              <button className="polkadot-button-outline px-4">
                Change
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              This wallet receives payments and manages treasury
            </p>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Business Type
            </label>
            <select className="polkadot-input w-full">
              <option>Technology</option>
              <option>Finance</option>
              <option>E-commerce</option>
              <option>Services</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Business Size
            </label>
            <select className="polkadot-input w-full">
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>200+ employees</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button className="polkadot-button">
            Save Profile
          </button>
        </div>
      </motion.div>

      {/* Agent Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="polkadot-card"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Agent Permissions</h2>
        
        <div className="bg-surface-secondary rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-primary font-medium">Agent Wallet</span>
            <span className="font-mono text-sm text-polkadot-primary">
              0x1234...5678
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-primary font-medium">Monthly Limit</span>
            <span className="mono-number text-text-primary">$5,000</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Fund Goals</div>
              <div className="text-sm text-text-secondary">Allow agent to fund treasury goals</div>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Rebalance Reserve</div>
              <div className="text-sm text-text-secondary">Allow agent to move funds between vault and reserve</div>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Withdraw to Liquid</div>
              <div className="text-sm text-text-secondary">Allow agent to withdraw savings to liquid reserve</div>
            </div>
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="polkadot-button">
            Update Permissions
          </button>
          <button className="polkadot-button-outline border-error text-error hover:bg-error hover:text-white">
            Revoke Agent Access
          </button>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="polkadot-card"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Notification Preferences</h2>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Payment Received</div>
              <div className="text-sm text-text-secondary">Get notified when payments are received</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.payments}
              onChange={(e) => setNotifications({...notifications, payments: e.target.checked})}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Goal Updates</div>
              <div className="text-sm text-text-secondary">Get notified when goals are funded or completed</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.goals}
              onChange={(e) => setNotifications({...notifications, goals: e.target.checked})}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Agent Actions</div>
              <div className="text-sm text-text-secondary">Get notified when AI agent takes actions</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.agent}
              onChange={(e) => setNotifications({...notifications, agent: e.target.checked})}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-text-primary">Monthly Reports</div>
              <div className="text-sm text-text-secondary">Receive monthly CFO reports</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.reports}
              onChange={(e) => setNotifications({...notifications, reports: e.target.checked})}
              className="w-5 h-5 text-polkadot-primary rounded focus:ring-polkadot-primary"
            />
          </label>
        </div>

        <div className="mt-6">
          <button className="polkadot-button">
            Save Preferences
          </button>
        </div>
      </motion.div>

      {/* Export Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="polkadot-card"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Export Data</h2>
        
        <div className="space-y-4">
          <p className="text-text-secondary">
            Export all your treasury data including transactions, goals, and agent logs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="polkadot-button-outline">
              📊 Export Transactions (CSV)
            </button>
            <button className="polkadot-button-outline">
              🎯 Export Goals (CSV)
            </button>
            <button className="polkadot-button-outline">
              🤖 Export Agent Logs (CSV)
            </button>
            <button className="polkadot-button-outline">
              📋 Export Full Report (PDF)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
