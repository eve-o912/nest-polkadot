// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NestTreasuryVault is ERC4626, AccessControl, ReentrancyGuard {

    bytes32 public constant AGENT_ROLE   = keccak256("AGENT_ROLE");
    bytes32 public constant SPLITTER_ROLE = keccak256("SPLITTER_ROLE");

    enum GoalStatus { ACTIVE, COMPLETED, PAUSED }

    struct BusinessGoal {
        string     name;
        uint256    targetAmount;   // in USDC (6 decimals)
        uint256    savedAmount;
        uint256    deadline;       // unix timestamp
        uint8      priority;       // 1 = most urgent
        GoalStatus status;
    }

    struct TreasuryPolicy {
        uint256 liquidReserve;       // min USDC always liquid
        uint8   autoSavePercent;     // 0-100
        uint256 monthlyBudget;       // max agent deploys/month
        uint256 deployedThisMonth;
        uint256 lastResetTimestamp;
        bool    agentEnabled;
    }

    mapping(address => BusinessGoal[])  public goals;
    mapping(address => TreasuryPolicy)  public policies;
    mapping(address => uint256)         public totalSaved;
    mapping(address => uint256)         public totalYieldEarned;

    event GoalCreated(address indexed business, uint8 index, string name, uint256 target);
    event GoalFunded(address indexed business, uint8 goalIndex, string goalName, uint256 amount);
    event PolicySet(address indexed business, uint256 reserve, uint8 savePercent);
    event PaymentSplit(address indexed business, uint256 total, uint256 saved, uint256 liquid);
    event AgentDeployed(address indexed business, uint256 amount, string reason);

    constructor(IERC20 asset)
        ERC4626(asset)
        ERC20("Nest Treasury Share", "nTRSY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Business sets their treasury policy
    function setPolicy(
        uint256 liquidReserve,
        uint8   autoSavePercent,
        uint256 monthlyBudget
    ) external {
        require(autoSavePercent <= 100, "Invalid percent");
        policies[msg.sender] = TreasuryPolicy(
            liquidReserve,
            autoSavePercent,
            monthlyBudget,
            0,
            block.timestamp,
            true
        );
        emit PolicySet(msg.sender, liquidReserve, autoSavePercent);
    }

    // Create a savings goal
    function createGoal(
        string  calldata name,
        uint256 target,
        uint256 deadline,
        uint8   priority
    ) external {
        require(priority >= 1, "Priority must be >= 1");
        goals[msg.sender].push(
            BusinessGoal(name, target, 0, deadline, priority, GoalStatus.ACTIVE)
        );
        emit GoalCreated(
            msg.sender,
            uint8(goals[msg.sender].length - 1),
            name,
            target
        );
    }

    // Called by NestPaySplitter after receiving payment
    function receiveAndSplit(
        address business,
        uint256 amount
    ) external nonReentrant onlyRole(SPLITTER_ROLE) {
        TreasuryPolicy memory p = policies[business];
        uint256 saveAmount = (amount * p.autoSavePercent) / 100;
        uint256 opAmount   = amount - saveAmount;

        if (saveAmount > 0) {
            deposit(saveAmount, business);
            totalSaved[business] += saveAmount;
        }

        emit PaymentSplit(business, amount, saveAmount, opAmount);
    }

    // Agent funds a specific goal — real on-chain action
    function agentFundGoal(
        address         business,
        uint8           goalIndex,
        uint256         amount,
        string calldata reason
    ) external nonReentrant onlyRole(AGENT_ROLE) {
        TreasuryPolicy storage p = policies[business];
        require(p.agentEnabled, "Agent disabled");

        // Reset monthly budget if new month
        if (block.timestamp >= p.lastResetTimestamp + 30 days) {
            p.deployedThisMonth = 0;
            p.lastResetTimestamp = block.timestamp;
        }

        require(
            p.deployedThisMonth + amount <= p.monthlyBudget,
            "Monthly budget exceeded"
        );

        p.deployedThisMonth += amount;
        goals[business][goalIndex].savedAmount += amount;
        totalSaved[business] += amount;

        if (goals[business][goalIndex].savedAmount >=
            goals[business][goalIndex].targetAmount) {
            goals[business][goalIndex].status = GoalStatus.COMPLETED;
        }

        deposit(amount, business);
        emit AgentDeployed(business, amount, reason);
        emit GoalFunded(
            business,
            goalIndex,
            goals[business][goalIndex].name,
            amount
        );
    }

    // Read all goals for a business
    function getGoals(address business)
        external view returns (BusinessGoal[] memory) {
        return goals[business];
    }

    // Read policy
    function getPolicy(address business)
        external view returns (TreasuryPolicy memory) {
        return policies[business];
    }
}
