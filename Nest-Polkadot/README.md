# Nest Treasury — AI-Powered Treasury Management on Polkadot

A B2B stablecoin savings and treasury management protocol built for the Polkadot Solidity Hackathon. Every transaction is real and on-chain with verifiable transaction hashes.

## 🎯 Hackathon Demo Flow

1. **Landing Page** - Connect wallet via Privy
2. **3-Step Onboarding** - Business setup, goals creation, AI policy recommendation
3. **Live Dashboard** - Real-time treasury data from Polkadot Hub
4. **Payment Split** - Simulate $100 USDC payment via NestPaySplitter
5. **Agent Action** - Click "Run Agent Now" to fund goals on-chain
6. **Verification** - Click transaction hash → Polkadot Hub block explorer

## 🏗️ Architecture

### Smart Contracts (Solidity 0.8.20)

- **NestTreasuryVault.sol** - ERC-4626 vault with business goals and policies
- **NestPaySplitter.sol** - Intercepts and splits every payment automatically
- **NestXCMTreasury.sol** - Cross-chain payments via Polkadot XCM precompile
- **NestAgentRegistry.sol** - On-chain agent permissions controlled by businesses

### Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Smart Contracts**: Solidity 0.8.20 + OpenZeppelin + Hardhat
- **AI Agent**: Google Gemini 2.0 Flash
- **Wallet**: Privy IO (social login + embedded wallets)
- **On-chain**: Viem + Polkadot Hub EVM RPC
- **Database**: Neon PostgreSQL + Upstash Redis
- **Deployment**: Vercel + Cron Jobs

## 🚀 Quick Start

### Prerequisites

```bash
npm install -g hardhat
```

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment template
cp .env.local .env.local

# Fill in your API keys and addresses
# See .env.local for required variables
```

### Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Polkadot Hub testnet
npm run deploy
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Environment Variables

```bash
# AI
GEMINI_API_KEY=your_gemini_api_key

# Polkadot Hub
POLKADOT_HUB_RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io
USDC_ADDRESS=0x... # USDC on Polkadot Asset Hub

# Deployed Contracts (after deployment)
NEST_VAULT_ADDRESS=0x...
NEST_SPLITTER_ADDRESS=0x...
NEST_XCM_ADDRESS=0x...
NEST_AGENT_REGISTRY_ADDRESS=0x...

# Wallet & Auth
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Database
DATABASE_URL=postgresql://...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Agent Keys
DEPLOYER_PRIVATE_KEY=0x...
AGENT_PRIVATE_KEY=0x...

# Cron
CRON_SECRET=your_cron_secret
```

## 📊 Database Schema

```sql
-- Businesses and their wallets
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_user_id TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL,
    business_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Treasury goals with on-chain mapping
CREATE TABLE treasury_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🏦',
    target_amount NUMERIC NOT NULL,
    saved_amount NUMERIC DEFAULT 0,
    deadline DATE,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    on_chain_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent activity logging
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    tool_name TEXT NOT NULL,
    input JSONB NOT NULL,
    result JSONB NOT NULL,
    reason TEXT NOT NULL,
    tx_hash TEXT,
    executed_at TIMESTAMPTZ DEFAULT now()
);

-- Treasury policies
CREATE TABLE treasury_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) UNIQUE,
    liquid_reserve NUMERIC DEFAULT 10000,
    auto_save_percent INTEGER DEFAULT 20,
    monthly_budget NUMERIC DEFAULT 5000,
    spent_this_month NUMERIC DEFAULT 0,
    agent_enabled BOOLEAN DEFAULT false,
    autopilot BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment history
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    payer_address TEXT,
    total_amount NUMERIC,
    saved_amount NUMERIC,
    liquid_amount NUMERIC,
    token TEXT DEFAULT 'USDC',
    tx_hash TEXT,
    from_para_id INTEGER,
    received_at TIMESTAMPTZ DEFAULT now()
);
```

## 🤖 AI Agent Features

The Gemini 2.0 Flash AI agent acts as an autonomous CFO:

### Decision Logic
1. **Reserve Check** - Never let liquid reserve drop below minimum
2. **Urgent Goals** - Fund goals due within 7 days first
3. **Priority Funding** - Fund by priority order (index 0 first)
4. **Monthly Reports** - Generate CFO reports at month-end
5. **Smart Alerts** - Send actionable notifications

### Tools Available
- `fund_goal` - Execute real on-chain transactions
- `rebalance_reserve` - Move funds between vault and reserve
- `send_alert` - Send notifications without transactions
- `generate_cfo_report` - Create plain English summaries

### Safety Controls
- Monthly budget limits
- Transaction size limits
- Autopilot vs notify-only modes
- Business-controlled permissions

## 🎨 Polkadot Brand Design

The UI follows Polkadot's brand guidelines:

### Colors
- **Primary Pink**: #E6007A
- **Surface Black**: #0A0A0A
- **Glassmorphism**: rgba(255,255,255,0.03)
- **Pink Glow**: rgba(230, 0, 122, 0.15)

### Components
- Animated Polkadot dot logo (6 ovals in circle)
- Pink accent buttons with glow effects
- Mono fonts for all on-chain data
- Glassmorphism cards with subtle borders

## 🔗 On-Chain Integration

### Real Transactions
- Every deposit produces a verifiable tx hash
- No mocks, no dummy data, no placeholders
- All data read live from Polkadot Hub blockchain

### Contract Interactions
```typescript
// Live balance reads
const usdcBalance = await getLiveUSDCBalance(walletAddress)
const vaultBalance = await getLiveVaultBalance(walletAddress)

// Real transaction execution
const result = await executeAgentFundGoal(
  businessAddress,
  goalIndex,
  amountUSDC,
  reason
)
```

## 📱 Demo Instructions

For hackathon judges, follow this exact flow:

1. **Open Landing Page** - See Polkadot-branded hero section
2. **Connect Wallet** - Use Privy social login
3. **Complete Onboarding** - 3-step coach with AI recommendations
4. **View Dashboard** - Live treasury data and goals
5. **Simulate Payment** - Call NestPaySplitter.pay() with $100 USDC
6. **Watch Split Happen** - $70 liquid, $30 to vault (real-time)
7. **Run Agent** - Click "Run Agent Now" button
8. **Verify On-Chain** - Click tx hash → Polkadot block explorer

## 🛡️ Security Features

- **Access Control** - Role-based permissions in contracts
- **Reentrancy Guards** - Prevent recursive calls
- **Budget Limits** - Agent cannot exceed monthly budgets
- **Business Control** - Companies control all agent permissions
- **Real Audits** - Every action logged with tx hash

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Cron Jobs
The AI agent runs daily at 9am UTC via Vercel Cron Jobs:
```json
{
  "crons": [
    {
      "path": "/api/agent/run",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for the Polkadot Solidity Hackathon**
