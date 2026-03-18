// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./NestTreasuryVault.sol";

contract NestPaySplitter is ReentrancyGuard {
    NestTreasuryVault public immutable vault;

    event PaymentReceived(
        address indexed payer,
        address indexed recipient,
        uint256 total,
        uint256 savedAmount,
        uint256 walletAmount,
        address token
    );

    constructor(address _vault) {
        vault = NestTreasuryVault(_vault);
    }

    // DAOs / businesses call this to pay a recipient
    // Payment is split automatically per recipient's policy
    function pay(
        address recipient,
        uint256 amount,
        address token
    ) external nonReentrant {
        require(amount > 0, "Zero amount");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        NestTreasuryVault.TreasuryPolicy memory policy =
            vault.getPolicy(recipient);

        uint256 saveAmount = 0;
        uint256 walletAmount = amount;

        if (policy.agentEnabled && policy.autoSavePercent > 0) {
            saveAmount   = (amount * policy.autoSavePercent) / 100;
            walletAmount = amount - saveAmount;

            // Send wallet portion to recipient immediately
            IERC20(token).transfer(recipient, walletAmount);

            // Send savings to vault
            IERC20(token).approve(address(vault), saveAmount);
            vault.receiveAndSplit(recipient, saveAmount);

        } else {
            // No policy set — send everything to recipient
            IERC20(token).transfer(recipient, amount);
        }

        emit PaymentReceived(
            msg.sender, recipient, amount,
            saveAmount, walletAmount, token
        );
    }
}
