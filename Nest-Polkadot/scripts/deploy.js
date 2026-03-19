const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from:", deployer.address);

    // 1. Deploy vault (needs USDC address)
    const USDC = process.env.USDC_ADDRESS;
    if (!USDC) {
        console.error("USDC_ADDRESS not set in environment");
        return;
    }
    
    const Vault = await ethers.getContractFactory("NestTreasuryVault");
    const vault = await Vault.deploy(USDC);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("NestTreasuryVault:", vaultAddress);

    // 2. Deploy splitter (needs vault)
    const Splitter = await ethers.getContractFactory("NestPaySplitter");
    const splitter = await Splitter.deploy(vaultAddress);
    await splitter.waitForDeployment();
    const splitterAddress = await splitter.getAddress();
    console.log("NestPaySplitter:", splitterAddress);

    // 3. Deploy XCM receiver (needs splitter)
    const XCM = await ethers.getContractFactory("NestXCMTreasury");
    const xcm = await XCM.deploy(splitterAddress);
    await xcm.waitForDeployment();
    const xcmAddress = await xcm.getAddress();
    console.log("NestXCMTreasury:", xcmAddress);

    // 4. Deploy agent registry
    const Registry = await ethers.getContractFactory("NestAgentRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("NestAgentRegistry:", registryAddress);

    // 5. Grant splitter role to splitter contract on vault
    const SPLITTER_ROLE = ethers.keccak256(
        ethers.toUtf8Bytes("SPLITTER_ROLE")
    );
    await vault.grantRole(SPLITTER_ROLE, splitterAddress);
    console.log("SPLITTER_ROLE granted");

    // 6. Grant agent role to deployer (agent backend wallet)
    const AGENT_ROLE = ethers.keccak256(
        ethers.toUtf8Bytes("AGENT_ROLE")
    );
    await vault.grantRole(AGENT_ROLE, deployer.address);
    console.log("AGENT_ROLE granted");

    console.log("\n── Copy these to .env ──");
    console.log("NEST_VAULT_ADDRESS=" + vaultAddress);
    console.log("NEST_SPLITTER_ADDRESS=" + splitterAddress);
    console.log("NEST_XCM_ADDRESS=" + xcmAddress);
    console.log("NEST_AGENT_REGISTRY_ADDRESS=" + registryAddress);
}

main().catch(console.error);
