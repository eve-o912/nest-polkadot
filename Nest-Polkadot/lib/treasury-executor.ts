import { createPublicClient, createWalletClient, http,
         parseUnits, formatUnits, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { neon } from '@neondatabase/serverless'

// Polkadot Hub chain config (EVM-compatible)
const polkadotHub = {
    id: 420420421, // confirm exact ID
    name: 'Polkadot Hub',
    nativeCurrency: { name: 'DOT', symbol: 'DOT', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.POLKADOT_HUB_RPC_URL!] }
    },
    blockExplorers: {
        default: {
            name: 'Polkadot Hub Explorer',
            url: 'https://blockscout.polkadot.io' // confirm URL
        }
    }
} as const

export const publicClient = createPublicClient({
    chain: polkadotHub,
    transport: http(process.env.POLKADOT_HUB_RPC_URL!)
})

const VAULT_ABI = parseAbi([
    'function getPolicy(address) view returns (tuple(uint256,uint8,uint256,uint256,uint256,bool))',
    'function getGoals(address) view returns (tuple(string,uint256,uint256,uint256,uint8,uint8)[])',
    'function agentFundGoal(address,uint8,uint256,string) nonpayable',
    'function totalAssets() view returns (uint256)',
    'function convertToAssets(uint256) view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
])

const ERC20_ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
])

const sql = neon(process.env.DATABASE_URL!)

export async function getLiveUSDCBalance(address: string) {
    const raw = await publicClient.readContract({
        address: process.env.USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
    })
    return Number(formatUnits(raw, 6))
}

export async function getLiveVaultBalance(address: string) {
    const shares = await publicClient.readContract({
        address: process.env.NEST_VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
    })
    const assets = await publicClient.readContract({
        address: process.env.NEST_VAULT_ADDRESS as `0x${string}`,
        abi: parseAbi(['function convertToAssets(uint256) view returns (uint256)']),
        functionName: 'convertToAssets',
        args: [shares]
    })
    return Number(formatUnits(assets, 6))
}

export async function getLiveAPY() {
    // Read from vault totalAssets over time or Polkadot API
    // For hackathon: fetch from public Polkadot Hub yield source
    try {
        const res = await fetch(
            `https://api.polkadot.io/v1/vault/${process.env.NEST_VAULT_ADDRESS}/apy` 
        )
        const data = await res.json()
        return data?.apy ?? 5.5
    } catch {
        return 5.5 // fallback
    }
}

export async function executeAgentFundGoal(
    businessAddress: string,
    goalIndex: number,
    amountUSDC: number,
    reason: string
) {
    try {
        // Agent wallet signs on behalf of the business
        const account = privateKeyToAccount(
            process.env.AGENT_PRIVATE_KEY as `0x${string}` 
        )
        const walletClient = createWalletClient({
            chain: polkadotHub,
            transport: http(process.env.POLKADOT_HUB_RPC_URL!),
            account,
        })

        const amountRaw = parseUnits(amountUSDC.toFixed(6), 6)

        const hash = await walletClient.writeContract({
            address: process.env.NEST_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'agentFundGoal',
            args: [
                businessAddress as `0x${string}`,
                goalIndex,
                amountRaw,
                reason
            ]
        })

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60_000
        })

        if (receipt.status !== 'success') {
            throw new Error('Transaction reverted')
        }

        return {
            success: true,
            txHash: hash,
            explorerUrl: `https://blockscout.polkadot.io/tx/${hash}` 
        }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
