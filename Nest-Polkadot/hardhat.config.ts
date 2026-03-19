import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        polkadotHub: {
            url: process.env.POLKADOT_HUB_RPC_URL!,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
            chainId: 420420421, // confirm exact Polkadot Hub testnet ID
        },
    },
    defaultNetwork: "hardhat",
};
export default config;
