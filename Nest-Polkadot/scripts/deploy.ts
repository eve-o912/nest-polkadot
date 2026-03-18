import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from:", deployer.address);

    // 1. Deploy vault (needs USDC address)
    const USDC = process.env.USDC_ADDRESS!;
    const Vault = await ethers.getContractFactory("NestTreasuryVault");
    const vault = await Vault.deploy(USDC);
    await vault.waitForDeployment();
    console.log("NestTreasuryVault:", await vault.getAddress());

    // 2. Deploy splitter (needs vault)
    const Splitter = await ethers.getContractFactory("NestPaySplitter");
    const splitter = await Splitter.deploy(await vault.getAddress());
    await splitter.waitForDeployment();
    console.log("NestPaySplitter:", await splitter.getAddress());

    // 3. Deploy XCM receiver (needs splitter)
    const XCM = await ethers.getContractFactory("NestXCMTreasury");
    const xcm = await XCM.deploy(await splitter.getAddress());
    await xcm.waitForDeployment();
    console.log("NestXCMTreasury:", await xcm.getAddress());

    // 4. Deploy agent registry
    const Registry = await ethers.getContractFactory("NestAgentRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    console.log("NestAgentRegistry:", await registry.getAddress());

    // 5. Grant splitter role to splitter contract on vault
    const SPLITTER_ROLE = ethers.keccak256(
        ethers.toUtf8Bytes("SPLITTER_ROLE")
    );
    await vault.grantRole(SPLITTER_ROLE, await splitter.getAddress());
    console.log("SPLITTER_ROLE granted");

    // 6. Grant agent role to deployer (agent backend wallet)
    const AGENT_ROLE = ethers.keccak256(
        ethers.toUtf8Bytes("AGENT_ROLE")
    );
    await vault.grantRole(AGENT_ROLE, deployer.address);
    console.log("AGENT_ROLE granted");

    console.log("\n── Copy these to .env ──");
    console.log("NEST_VAULT_ADDRESS=" + await vault.getAddress());
    console.log("NEST_SPLITTER_ADDRESS=" + await splitter.getAddress());
    console.log("NEST_XCM_ADDRESS=" + await xcm.getAddress());
    console.log("NEST_AGENT_REGISTRY_ADDRESS=" + await registry.getAddress());
}

main().catch(console.error);
