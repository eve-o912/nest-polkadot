// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NestPaySplitter.sol";

// XCM precompile — deployed at this address on Polkadot Hub
interface IXCMPrecompile {
    function transferAssetsUsingTypeAndThen(
        uint8          assetTransferType,
        bytes calldata assetsEncoded,
        uint8          feeAssetItem,
        uint8          weightLimit,
        bytes calldata xcmEncoded,
        bytes calldata remoteXcmEncoded
    ) external returns (bool);
}

contract NestXCMTreasury is Ownable {
    // XCM precompile address on Polkadot Hub
    IXCMPrecompile constant XCM =
        IXCMPrecompile(0x0000000000000000000000000000000000000804);

    NestPaySplitter public splitter;

    event XCMPaymentReceived(
        uint32  indexed fromParaId,
        address indexed business,
        uint256 amount
    );

    event XCMWithdrawal(
        address indexed business,
        uint32  indexed toParaId,
        uint256 amount
    );

    constructor(address _splitter) Ownable(msg.sender) {
        splitter = NestPaySplitter(_splitter);
    }

    // Called when XCM payment arrives from another parachain
    function onPaymentReceived(
        uint32  fromParaId,
        address recipient,
        uint256 amount,
        address token
    ) external onlyOwner {
        // Route through PaySplitter — split happens automatically
        IERC20(token).approve(address(splitter), amount);
        splitter.pay(recipient, amount, token);

        emit XCMPaymentReceived(fromParaId, recipient, amount);
    }

    // Business withdraws savings to any parachain
    function withdrawToParachain(
        uint32  toParaId,
        bytes   calldata beneficiary,
        address token,
        uint256 amount
    ) external {
        // Build XCM transfer back to target parachain
        // Implementation depends on final Polkadot Hub XCM API
        emit XCMWithdrawal(msg.sender, toParaId, amount);
    }
}
