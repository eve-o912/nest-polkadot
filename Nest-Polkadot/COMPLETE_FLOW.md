# 🔄 Complete Nest Treasury System Flow

## **Real Implementation Architecture**

```mermaid
graph TB
    %% User Interface Layer
    A[User Landing Page] --> B[Dashboard Page]
    B --> C[Overview Tab]
    B --> D[Goals Tab]
    B --> E[Payments Tab]
    B --> F[Agent Tab]
    B --> G[Settings Tab]
    
    %% API Layer
    C --> H[/api/treasury/data]
    D --> I[/api/goals/crud]
    E --> J[/api/payments/process]
    F --> K[/api/agent/run]
    G --> L[/api/settings/update]
    
    %% AI Agent System
    K --> M[Google Gemini AI]
    M --> N[AI Decision Engine]
    N --> O[fund_goal Tool]
    N --> P[rebalance_reserve Tool]
    N --> Q[send_alert Tool]
    
    %% Smart Contract Layer
    O --> R[NestTreasuryVault]
    P --> R
    Q --> S[Notification System]
    
    %% Blockchain Layer
    R --> T[Polkadot Hub EVM]
    T --> U[USDC Token Contract]
    T --> V[Block Explorer]
    
    %% Data Layer
    H --> W[Neon PostgreSQL]
    I --> W
    J --> W
    K --> W
    L --> W
    
    %% Cache Layer
    W --> X[Upstash Redis]
    X --> H
    X --> I
    X --> J
    
    %% Authentication
    A --> Y[Privy Auth]
    Y --> Z[Wallet Connection]
    Z --> B
    
    %% Real-time Updates
    T --> AA[WebSocket Events]
    AA --> B
```

## **Detailed Flow Breakdown**

### 1. **User Authentication Flow**
```
User visits site → Privy authentication prompt → Connect wallet → Session established → Dashboard loads
```

**Technical Implementation:**
- `PRIVY_APP_ID` and `PRIVY_APP_SECRET` in `.env`
- Wallet address stored in session
- All API calls authenticated with wallet signature

### 2. **Treasury Data Flow**
```
Dashboard load → API call → Live blockchain data → Database cache → Frontend display
```

**Live Data Sources:**
- `getLiveUSDCBalance()` - Current USDC balance
- `getLiveVaultBalance()` - Vault investment balance  
- `getLiveAPY()` - Current yield rate
- All from `treasury-executor.ts`

### 3. **AI Agent Execution Flow**
```
Scheduled trigger → /api/agent/run → Gemini AI → Tool selection → Smart contract execution → Log result
```

**AI Agent Tools:**
```typescript
// From route.ts
fund_goal: {
  goal_index: number,
  goal_name: string, 
  amount_usdc: number,
  reason: string
}

rebalance_reserve: {
  amount_usdc: number,
  reason: string
}

send_alert: {
  message: string,
  urgency: 'low' | 'medium' | 'high'
}
```

### 4. **Smart Contract Interaction Flow**
```
User action → Frontend → API → Treasury Executor → Viem client → Smart contract → Blockchain
```

**Contract Architecture:**
- `NestTreasuryVault.sol` - Main vault with ERC4626 yield
- `NestPaySplitter.sol` - Auto-splits payments 30/70
- `NestAgentRegistry.sol` - Manages AI permissions
- `NestXCMTreasury.sol` - Cross-chain transfers

### 5. **Payment Processing Flow**
```
Payment received → NestPaySplitter → 30% to vault → 70% liquid → Database record → UI update
```

**Split Logic:**
```solidity
// From NestPaySplitter.sol
function splitPayment(uint256 amount) {
    uint256 savedAmount = (amount * savePercent) / 100;
    uint256 liquidAmount = amount - savedAmount;
    
    // Transfer portions
    ERC20(usdc).transfer(vaultAddress, savedAmount);
    ERC20(usdc).transfer(businessAddress, liquidAmount);
}
```

### 6. **Goal Management Flow**
```
Create goal → Set target/deadline → Track progress → Auto-fund by AI → Complete when reached
```

**Goal Structure:**
```solidity
struct BusinessGoal {
    string name;
    uint256 targetAmount;   // USDC with 6 decimals
    uint256 savedAmount;
    uint256 deadline;       // Unix timestamp
    uint8 priority;         // 1 = most urgent
    GoalStatus status;      // ACTIVE, COMPLETED, PAUSED
}
```

### 7. **Real-time Update Flow**
```
Blockchain event → WebSocket → Frontend listener → State update → UI refresh
```

**Event Types:**
- `GoalFunded` - When AI funds a goal
- `PaymentReceived` - New payment arrives
- `PolicyUpdated` - Settings changed
- `YieldGenerated` - Vault earns returns

### 8. **Data Persistence Flow**
```
Action occurs → Database transaction → Redis cache update → Background sync
```

**Database Schema:**
```sql
-- Main tables
businesses (id, name, wallet_address, created_at)
goals (id, business_id, name, target, saved, deadline, priority)
payments (id, business_id, amount, saved, liquid, tx_hash, timestamp)
agent_logs (id, business_id, tool, parameters, result, timestamp)
```

### 9. **Security Flow**
```
Request → Privy auth → Role check → Smart contract permission → Execute → Log
```

**Security Layers:**
1. **Frontend**: Privy wallet authentication
2. **API**: Role-based access control
3. **Smart Contract**: OpenZeppelin AccessControl
4. **Blockchain**: Immutable transaction record

### 10. **Performance Optimization Flow**
```
User request → Redis cache check → Cache hit? → Return data / Database query → Update cache
```

**Cache Strategy:**
- Treasury balances: 30-second TTL
- Goal progress: 5-minute TTL
- Payment history: 1-hour TTL
- Agent logs: 15-minute TTL

---

## **Live Working Example**

### **Daily Operation Flow:**

**6:00 AM - AI Agent Wake-up:**
```javascript
// /api/agent/run triggered by cron
const agentResponse = await genAI.generateContent({
  contents: [{
    role: "user",
    parts: [{text: `Review treasury status and take action`}]
  }],
  tools: AGENT_TOOLS
})
```

**9:00 AM - Payment Arrives:**
```solidity
// NestPaySplitter.sol
function onTokenTransfer(address from, uint256 amount) {
    uint256 saved = (amount * 30) / 100;  // 30% saved
    uint256 liquid = amount - saved;      // 70% liquid
    
    IERC20(usdc).transfer(vault, saved);
    IERC20(usdc).transfer(business, liquid);
    
    emit PaymentSplit(from, saved, liquid);
}
```

**12:00 PM - Goal Deadline Check:**
```typescript
// AI Agent detects urgent goal
if (daysToDeadline <= 7 && savedAmount < targetAmount) {
    await executeAgentFundGoal(goalIndex, amount, "Urgent deadline funding");
}
```

**6:00 PM - Daily Report:**
```sql
-- Generate daily summary
SELECT 
    SUM(amount) as total_payments,
    SUM(saved) as total_saved,
    COUNT(*) as transaction_count
FROM payments 
WHERE DATE(timestamp) = CURRENT_DATE;
```

---

## **Technology Stack Flow**

```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
    ↓
Authentication: Privy (wallet connection)
    ↓
API Layer: Next.js API Routes
    ↓
AI Engine: Google Gemini (decision making)
    ↓
Blockchain: Polkadot Hub EVM + Viem
    ↓
Smart Contracts: Solidity + OpenZeppelin
    ↓
Database: Neon PostgreSQL
    ↓
Cache: Upstash Redis
    ↓
Deployment: Vercel (frontend) + Railway (backend)
```

This complete flow shows how every component works together in real-time to provide automated treasury management for businesses on Polkadot!
