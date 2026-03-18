// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NestAgentRegistry is Ownable {

    struct AgentPermissions {
        address agentWallet;
        uint256 maxPerTransaction;  // USDC max per action (6 decimals)
        uint256 monthlyLimit;       // USDC max per month
        bool    canFundGoals;
        bool    canRebalance;
        bool    canWithdrawToLiquid;
        bool    active;
        uint256 grantedAt;
    }

    mapping(address => AgentPermissions) public permissions;

    event AgentAuthorised(
        address indexed business,
        address indexed agent,
        uint256 monthlyLimit
    );
    event AgentRevoked(address indexed business);
    event PermissionsUpdated(address indexed business);

    constructor() Ownable(msg.sender) {}

    function authorise(
        address agentWallet,
        uint256 maxPerTx,
        uint256 monthlyLimit,
        bool    canFundGoals,
        bool    canRebalance,
        bool    canWithdraw
    ) external {
        permissions[msg.sender] = AgentPermissions(
            agentWallet, maxPerTx, monthlyLimit,
            canFundGoals, canRebalance, canWithdraw,
            true, block.timestamp
        );
        emit AgentAuthorised(msg.sender, agentWallet, monthlyLimit);
    }

    function revoke() external {
        permissions[msg.sender].active = false;
        emit AgentRevoked(msg.sender);
    }

    function isAuthorised(address business, address agent)
        external view returns (bool) {
        AgentPermissions memory p = permissions[business];
        return p.active && p.agentWallet == agent;
    }

    function getPermissions(address business)
        external view returns (AgentPermissions memory) {
        return permissions[business];
    }
}
