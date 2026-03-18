import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { neon } from '@neondatabase/serverless'
import { Redis } from '@upstash/redis'
import {
    getLiveUSDCBalance, getLiveVaultBalance,
    getLiveAPY, executeAgentFundGoal
} from '@/lib/treasury-executor'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const sql = neon(process.env.DATABASE_URL!)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const AGENT_TOOLS = [{
    functionDeclarations: [
        {
            name: 'fund_goal',
            description: 'Fund a specific treasury goal with USDC. Executes a real on-chain transaction on Polkadot Hub.',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    goal_index: { type: SchemaType.NUMBER, description: 'Goal index (0-based)' },
                    goal_name: { type: SchemaType.STRING, description: 'Goal name for logging' },
                    amount_usdc: { type: SchemaType.NUMBER, description: 'USDC to deposit (min 1.0)' },
                    reason: { type: SchemaType.STRING, description: 'Plain English reason shown to business' },
                },
                required: ['goal_index', 'goal_name', 'amount_usdc', 'reason'],
            },
        },
        {
            name: 'rebalance_reserve',
            description: 'Move funds from vault back to liquid reserve if reserve is low.',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    amount_usdc: { type: SchemaType.NUMBER },
                    reason: { type: SchemaType.STRING },
                },
                required: ['amount_usdc', 'reason'],
            },
        },
        {
            name: 'send_alert',
            description: 'Send an alert to the business without moving funds.',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    message: { type: SchemaType.STRING },
                    urgency: { type: SchemaType.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                    action_required: { type: SchemaType.BOOLEAN },
                },
                required: ['message', 'urgency', 'action_required'],
            },
        },
        {
            name: 'generate_cfo_report',
            description: 'Generate a plain English monthly CFO treasury report.',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    report: { type: SchemaType.STRING, description: 'Full CFO report in plain English' },
                },
                required: ['report'],
            },
        },
    ],
}]

export async function POST(req: Request) {
    const isCron = req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}` 
    const body = await req.json().catch(() => ({}))

    // Load businesses to run agent for
    let businesses: any[] = []
    if (isCron) {
        businesses = await sql`
            SELECT b.*, tp.* FROM businesses b
            JOIN treasury_policies tp ON tp.business_id = b.id
            WHERE tp.agent_enabled = true
        `
    } else if (body.businessId) {
        const rows = await sql`
            SELECT b.*, tp.* FROM businesses b
            JOIN treasury_policies tp ON tp.business_id = b.id
            WHERE b.id = ${body.businessId}
            AND tp.agent_enabled = true
        `
        businesses = rows
    }

    const results = []

    for (const biz of businesses) {
        const dedupKey = `agent:${biz.id}:${new Date().toISOString().split('T')[0]}` 
        if (isCron && await redis.get(dedupKey)) {
            results.push({ businessId: biz.id, skipped: 'already ran today' })
            continue
        }

        try {
            // ── Fetch ALL live data ──────────────────────────
            const [usdcBalance, vaultBalance, apy, goals] = await Promise.all([
                getLiveUSDCBalance(biz.wallet_address),
                getLiveVaultBalance(biz.wallet_address),
                getLiveAPY(),
                sql`SELECT * FROM treasury_goals WHERE business_id = ${biz.id} AND status = 'active' ORDER BY priority ASC` 
            ])

            const today = new Date()
            const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })
            const remaining = biz.monthly_budget - biz.spent_this_month
            const isEndOfMonth = today.getDate() >= 25

            // Check upcoming payroll (any goals with deadline in next 7 days)
            const urgentGoals = goals.filter((g: any) => {
                const daysLeft = Math.floor(
                    (new Date(g.deadline).getTime() - Date.now()) / 86400000
                )
                return daysLeft <= 7 && daysLeft >= 0
            })

            const agentPrompt = `
You are the Nest Treasury AI agent — the autonomous CFO for ${biz.business_name || 'this business'}.
Today is ${dayOfWeek}, ${today.toDateString()}.

LIVE DATA FROM POLKADOT HUB BLOCKCHAIN:
- USDC liquid reserve: $${usdcBalance.toFixed(2)}
- Vault balance (earning yield): $${vaultBalance.toFixed(2)}
- Total treasury: $${(usdcBalance + vaultBalance).toFixed(2)}
- Current vault APY: ${apy.toFixed(1)}%

TREASURY POLICY:
- Mode: ${biz.autopilot ? 'AUTOPILOT — execute real transactions' : 'NOTIFY ONLY — no transactions'}
- Minimum liquid reserve: $${biz.liquid_reserve.toFixed(2)}
- Monthly agent budget: $${biz.monthly_budget.toFixed(2)}
- Spent this month: $${biz.spent_this_month.toFixed(2)}
- Remaining budget: $${remaining.toFixed(2)}
- Auto-save percent: ${biz.auto_save_percent}% of every incoming payment

ACTIVE TREASURY GOALS (sorted by priority):
${JSON.stringify(goals.map((g: any, i: number) => ({
    index: i,
    name: g.name,
    target: g.target_amount,
    saved: g.saved_amount,
    progress: Math.round((g.saved_amount / g.target_amount) * 100) + '%',
    deadline: g.deadline,
    daysLeft: Math.floor((new Date(g.deadline).getTime() - Date.now()) / 86400000),
    priority: g.priority
})), null, 2)}

ALERTS:
- Goals due within 7 days: ${urgentGoals.length}
- End of month approaching: ${isEndOfMonth}
- Liquid reserve below minimum: ${usdcBalance < biz.liquid_reserve}

DECISION CHECKLIST — evaluate each in order:
1. Is liquid reserve below minimum ($${biz.liquid_reserve})? 
   → CRITICAL: call rebalance_reserve immediately, then send_alert
2. Are there goals due within 7 days that are underfunded?
   → call fund_goal for highest priority urgent goal
3. Does any goal have remaining budget and is below target?
   → call fund_goal by priority order (index 0 first)
4. Is it the last week of the month?
   → call generate_cfo_report with full treasury summary
5. Any other observations?
   → call send_alert with relevant message

HARD RULES — never break:
- Never let liquid reserve drop below $${biz.liquid_reserve}
- Never exceed remaining monthly budget of $${remaining.toFixed(2)}
- If autopilot is OFF, only call send_alert or generate_cfo_report
- Always give plain English reasons a non-technical founder understands
- Minimum deposit is $1.00 USDC

Make all applicable decisions now.
`

            // ── Run Gemini agent loop ────────────────────────
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                tools: AGENT_TOOLS,
            })

            const chat = model.startChat()
            let response = await chat.sendMessage(agentPrompt)
            const actions = []

            while (true) {
                const parts = response.candidates?.[0]?.content?.parts ?? []
                const toolCalls = parts.filter((p: any) => p.functionCall)
                if (!toolCalls.length) break

                const toolResults = []
                for (const part of toolCalls as any[]) {
                    const { name, args } = part.functionCall
                    let result: any = { success: false }

                    if (name === 'fund_goal' && biz.autopilot) {
                        // Budget guard
                        if (args.amount_usdc > remaining) {
                            result = {
                                success: false,
                                error: `Exceeds budget. Remaining: $${remaining.toFixed(2)}` 
                            }
                        } else {
                            result = await executeAgentFundGoal(
                                biz.wallet_address,
                                args.goal_index,
                                args.amount_usdc,
                                args.reason
                            )
                            if (result.success) {
                                await sql`
                                    UPDATE treasury_policies
                                    SET spent_this_month = spent_this_month + ${args.amount_usdc}
                                    WHERE business_id = ${biz.id}
                                `
                                await sql`
                                    UPDATE treasury_goals
                                    SET saved_amount = saved_amount + ${args.amount_usdc}
                                    WHERE business_id = ${biz.id}
                                    AND on_chain_index = ${args.goal_index}
                                `
                            }
                        }
                    } else if (name === 'send_alert' || name === 'generate_cfo_report') {
                        result = { success: true, logged: true }
                    } else if (!biz.autopilot) {
                        result = { success: true, skipped: true, reason: 'Autopilot OFF' }
                    }

                    // Log every action
                    await sql`
                        INSERT INTO agent_logs
                        (business_id, tool_name, input, result, reason, tx_hash)
                        VALUES (
                            ${biz.id}, ${name},
                            ${JSON.stringify(args)},
                            ${JSON.stringify(result)},
                            ${args.reason || args.message || args.report || ''},
                            ${result.txHash ?? null}
                        )
                    `

                    actions.push({ tool: name, args, result })
                    toolResults.push({ functionResponse: { name, response: result } })
                }
                response = await chat.sendMessage(toolResults)
            }

            await redis.set(dedupKey, '1', { ex: 90000 })
            results.push({ businessId: biz.id, actions })

        } catch (err: any) {
            await sql`
                INSERT INTO agent_logs (business_id, tool_name, input, result, reason)
                VALUES (
                    ${biz.id}, 'error', '{}',
                    ${JSON.stringify({ error: err.message })},
                    'Agent crashed'
                )
            `
            results.push({ businessId: biz.id, error: err.message })
        }
    }

    return Response.json({ ran: results.length, results })
}
