'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PolkadotDot from '@/components/PolkadotDot'
import OverviewTab from '@/components/dashboard/OverviewTab'
import GoalsTab from '@/components/dashboard/GoalsTab'
import PaymentsTab from '@/components/dashboard/PaymentsTab'
import AgentTab from '@/components/dashboard/AgentTab'
import SettingsTab from '@/components/dashboard/SettingsTab'

type Tab = 'overview' | 'goals' | 'payments' | 'agent' | 'settings'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'agent', label: 'Agent', icon: '🤖' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'goals':
        return <GoalsTab />
      case 'payments':
        return <PaymentsTab />
      case 'agent':
        return <AgentTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-surface-secondary border-r border-border">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <PolkadotDot size="sm" animated={false} />
            <span className="text-xl font-bold text-polkadot-primary">Nest Treasury</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-polkadot-primary text-white shadow-polkadot-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mini Treasury Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <div className="text-sm text-text-secondary mb-1">Total Treasury</div>
          <div className="mono-number text-lg font-bold text-text-primary mb-1">$124,500</div>
          <div className="text-xs text-success">Yield: $840/mo</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {renderTab()}
        </motion.div>
      </div>
    </div>
  )
}
