'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PolkadotDotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animated?: boolean
}

const PolkadotDot = ({ size = 'md', className, animated = true }: PolkadotDotProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const dotPositions = [
    { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
    { top: '25%', left: '93.3%', transform: 'translate(-50%, -50%)' },
    { top: '75%', left: '93.3%', transform: 'translate(-50%, -50%)' },
    { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' },
    { top: '75%', left: '6.7%', transform: 'translate(-50%, -50%)' },
    { top: '25%', left: '6.7%', transform: 'translate(-50%, -50%)' },
  ]

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {animated && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {dotPositions.map((pos, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 bg-polkadot-primary rounded-full"
              style={{
                top: pos.top,
                left: pos.left,
                transform: pos.transform,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </motion.div>
      )}
      
      {!animated && (
        <div className="absolute inset-0">
          {dotPositions.map((pos, index) => (
            <div
              key={index}
              className="absolute w-3 h-3 bg-polkadot-primary rounded-full"
              style={{
                top: pos.top,
                left: pos.left,
                transform: pos.transform,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PolkadotDot
