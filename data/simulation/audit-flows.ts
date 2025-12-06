// Simulation data for Audit flows
import type { AuditResponse } from "@/lib/types"

export const safeContractAuditSimulation: AuditResponse = {
  riskLevel: "low",
  summary:
    "This contract follows standard ERC-20 implementation patterns with no critical vulnerabilities detected. The code is well-structured with appropriate access controls and event emissions.",
  criticalIssues: [],
  warnings: [
    {
      severity: "warning",
      title: "Centralized Ownership",
      description:
        "The contract owner has the ability to pause transfers. Consider implementing a timelock or multi-sig for admin functions.",
      lineNumber: 45,
    },
  ],
  infoNotes: [
    {
      severity: "info",
      title: "Standard Implementation",
      description: "Contract follows OpenZeppelin ERC-20 standards which is a good security practice.",
    },
    {
      severity: "info",
      title: "Events Properly Emitted",
      description: "All state-changing functions emit appropriate events for off-chain tracking.",
    },
  ],
  contractCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeToken is ERC20, Ownable {
    bool public paused;
    
    constructor() ERC20("SafeToken", "SAFE") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!paused, "Transfers paused");
        super._beforeTokenTransfer(from, to, amount);
    }
}`,
}

export const riskyContractAuditSimulation: AuditResponse = {
  riskLevel: "critical",
  summary:
    "CRITICAL: This contract contains multiple high-severity vulnerabilities including a reentrancy attack vector and unprotected external calls. DO NOT interact with this contract.",
  criticalIssues: [
    {
      severity: "critical",
      title: "Reentrancy Vulnerability",
      description:
        "The withdraw function updates state after external call, allowing reentrancy attacks that could drain the contract.",
      lineNumber: 28,
    },
    {
      severity: "critical",
      title: "Unprotected Selfdestruct",
      description:
        "The contract includes a selfdestruct function callable by owner that could destroy the contract and lock funds.",
      lineNumber: 52,
    },
  ],
  warnings: [
    {
      severity: "warning",
      title: "Missing Input Validation",
      description: "The deposit function doesn't validate the amount parameter, allowing zero-value deposits.",
      lineNumber: 15,
    },
    {
      severity: "warning",
      title: "Floating Pragma",
      description:
        "Contract uses floating pragma (^0.8.0) which may introduce inconsistent behavior across compiler versions.",
      lineNumber: 1,
    },
  ],
  infoNotes: [
    {
      severity: "info",
      title: "No Event Emissions",
      description: "Critical state changes don't emit events, making off-chain tracking difficult.",
    },
  ],
  contractCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RiskyVault {
    mapping(address => uint256) public balances;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    // VULNERABLE: Reentrancy
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        balances[msg.sender] -= amount; // State update after external call!
    }
    
    // DANGEROUS: Unprotected selfdestruct
    function destroy() external {
        require(msg.sender == owner);
        selfdestruct(payable(owner));
    }
}`,
}

export const mediumRiskAuditSimulation: AuditResponse = {
  riskLevel: "medium",
  summary:
    "This contract has some concerns that should be addressed before heavy usage. No critical vulnerabilities found, but several medium-severity issues warrant attention.",
  criticalIssues: [],
  warnings: [
    {
      severity: "warning",
      title: "Missing Zero-Address Check",
      description: "Transfer function doesn't validate recipient address, allowing tokens to be burned accidentally.",
      lineNumber: 34,
    },
    {
      severity: "warning",
      title: "Unlimited Token Minting",
      description: "Owner can mint unlimited tokens without any cap, which could lead to inflation.",
      lineNumber: 48,
    },
    {
      severity: "warning",
      title: "No Transfer Cooldown",
      description: "Large transfers could be used for flash loan attacks on connected DeFi protocols.",
    },
  ],
  infoNotes: [
    {
      severity: "info",
      title: "Consider Adding Rate Limiting",
      description: "For enhanced security, consider implementing transfer rate limits.",
    },
  ],
}

export const auditThinkingSteps = [
  "Analyzing contract bytecode...",
  "Running ChainGPT security scan...",
  "Checking for known vulnerabilities...",
  "Analyzing access controls...",
  "Generating audit report...",
]
