# Quack × ChainGPT Agent - API Specification

This document describes the API requests and data flows used by the frontend chat interface. Backend engineers should implement these endpoints to support the full functionality of the agent.

## Table of Contents

1. [Authentication & Wallet](#authentication--wallet)
2. [Research Endpoints](#research-endpoints)
3. [Audit Endpoints](#audit-endpoints)
4. [Action Endpoints](#action-endpoints)
5. [Policy Management](#policy-management)
6. [Transaction Execution](#transaction-execution)
7. [WebSocket Events](#websocket-events)

---

## Authentication & Wallet

### Connect Wallet

\`\`\`http
POST /api/wallet/connect
\`\`\`

**Request Body:**
\`\`\`json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f8F8a3",
  "signature": "0x...",
  "message": "Sign this message to connect to Quack Agent: {nonce}"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "sessionToken": "jwt_token_here",
  "wallet": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8F8a3",
    "name": "Main Wallet",
    "isActive": true
  }
}
\`\`\`

### Switch Network

\`\`\`http
POST /api/wallet/network
\`\`\`

**Request Body:**
\`\`\`json
{
  "network": "bnb-testnet" | "bnb-mainnet"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "network": "bnb-testnet",
  "chainId": 97
}
\`\`\`

### Get Wallets

\`\`\`http
GET /api/wallet/list
\`\`\`

**Response:**
\`\`\`json
{
  "wallets": [
    {
      "address": "0x742d...",
      "name": "Main Wallet",
      "isActive": true
    }
  ]
}
\`\`\`

---

## Research Endpoints

### Token Research

\`\`\`http
POST /api/research/token
\`\`\`

**Request Body:**
\`\`\`json
{
  "query": "Explain this token and show top holders",
  "contractAddress": "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
  "network": "bnb-testnet"
}
\`\`\`

**Response (Streaming via SSE):**
\`\`\`json
{
  "type": "thinking",
  "step": "Querying ChainGPT for token data..."
}
\`\`\`
\`\`\`json
{
  "type": "result",
  "data": {
    "summary": "PEPE is a meme token on the BNB Chain...",
    "tokenDetails": {
      "name": "Pepe Token",
      "symbol": "PEPE",
      "contractAddress": "0x25d8...",
      "marketCap": "$1.2B",
      "holderCount": 245892,
      "liquidity": "$45.2M",
      "verified": true,
      "topHolders": [
        {
          "address": "0x1234...abcd",
          "percentage": 12.5,
          "tags": ["Exchange Hot Wallet", "Binance"]
        }
      ]
    }
  }
}
\`\`\`

### General Research Query

\`\`\`http
POST /api/research/query
\`\`\`

**Request Body:**
\`\`\`json
{
  "query": "What is the TVL of PancakeSwap?",
  "context": {
    "previousMessages": [],
    "network": "bnb-mainnet"
  }
}
\`\`\`

---

## Audit Endpoints

### Audit Contract by Address

\`\`\`http
POST /api/audit/address
\`\`\`

**Request Body:**
\`\`\`json
{
  "contractAddress": "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
  "network": "bnb-testnet"
}
\`\`\`

**Response (Streaming via SSE):**
\`\`\`json
{
  "type": "thinking",
  "step": "Analyzing contract bytecode..."
}
\`\`\`
\`\`\`json
{
  "type": "result",
  "data": {
    "riskLevel": "low" | "medium" | "high" | "critical",
    "summary": "This contract follows standard ERC-20 implementation...",
    "criticalIssues": [],
    "warnings": [
      {
        "severity": "warning",
        "title": "Centralized Ownership",
        "description": "The contract owner has ability to pause...",
        "lineNumber": 45
      }
    ],
    "infoNotes": [],
    "contractCode": "// SPDX-License-Identifier: MIT..."
  }
}
\`\`\`

### Audit Contract by Code

\`\`\`http
POST /api/audit/code
\`\`\`

**Request Body:**
\`\`\`json
{
  "code": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;...",
  "language": "solidity"
}
\`\`\`

### Audit Contract by ABI

\`\`\`http
POST /api/audit/abi
\`\`\`

**Request Body:**
\`\`\`json
{
  "abi": [...],
  "contractAddress": "0x..."
}
\`\`\`

---

## Action Endpoints

### Prepare Transfer

\`\`\`http
POST /api/action/prepare/transfer
\`\`\`

**Request Body:**
\`\`\`json
{
  "fromWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f8F8a3",
  "toAddress": "0xabc...def",
  "amount": "10",
  "token": "USDT",
  "network": "bnb-testnet"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "action": {
    "type": "transfer",
    "title": "Prepare Transfer Action",
    "summary": "Transfer 10 USDT from Main Wallet to 0xabc...def",
    "fromWallet": "0x742d...",
    "toAddress": "0xabc...def",
    "network": "bnb-testnet",
    "tokenAmount": "10",
    "tokenSymbol": "USDT",
    "spendCapUsage": {
      "amount": 10,
      "token": "USDT",
      "remaining": 90,
      "total": 100
    },
    "isAllowed": true,
    "isDenied": false,
    "gasEstimate": "0.0005 BNB (~$0.15)",
    "gasSponsored": true,
    "policyName": "Default Policy",
    "riskWarnings": [],
    "rawData": "0xa9059cbb...",
    "abiCall": "transfer(address to, uint256 amount)"
  }
}
\`\`\`

### Prepare Swap

\`\`\`http
POST /api/action/prepare/swap
\`\`\`

**Request Body:**
\`\`\`json
{
  "fromWallet": "0x742d...",
  "fromToken": "BNB",
  "toToken": "USDT",
  "amount": "0.5",
  "slippage": 0.5,
  "network": "bnb-testnet"
}
\`\`\`

### Prepare Deploy

\`\`\`http
POST /api/action/prepare/deploy
\`\`\`

**Request Body:**
\`\`\`json
{
  "fromWallet": "0x742d...",
  "contractCode": "// SPDX-License-Identifier...",
  "constructorArgs": {
    "name": "MyToken",
    "symbol": "MTK",
    "initialSupply": "1000000"
  },
  "network": "bnb-testnet"
}
\`\`\`

### Prepare Contract Call

\`\`\`http
POST /api/action/prepare/call
\`\`\`

**Request Body:**
\`\`\`json
{
  "fromWallet": "0x742d...",
  "contractAddress": "0xContract...",
  "functionName": "approve",
  "args": ["0xSpender...", "1000000000000000000"],
  "value": "0",
  "network": "bnb-testnet"
}
\`\`\`

---

## Policy Management

### Get Current Policy

\`\`\`http
GET /api/policy/current
\`\`\`

**Response:**
\`\`\`json
{
  "policy": {
    "id": "default-policy",
    "name": "Default Policy",
    "spendCaps": [
      {
        "token": "USDT",
        "symbol": "USDT",
        "limit": 100,
        "used": 10,
        "remaining": 90
      }
    ],
    "allowList": [
      {
        "address": "0xPancakeSwap...",
        "label": "PancakeSwap Router",
        "type": "allow"
      }
    ],
    "denyList": [
      {
        "address": "0xKnownScam...",
        "label": "Known Scam",
        "type": "deny"
      }
    ]
  }
}
\`\`\`

### Update Spend Cap

\`\`\`http
PUT /api/policy/spend-cap
\`\`\`

**Request Body:**
\`\`\`json
{
  "token": "USDT",
  "newLimit": 200
}
\`\`\`

### Add to Allow List

\`\`\`http
POST /api/policy/allow-list
\`\`\`

**Request Body:**
\`\`\`json
{
  "address": "0xNewAddress...",
  "label": "My Friend"
}
\`\`\`

### Add to Deny List

\`\`\`http
POST /api/policy/deny-list
\`\`\`

**Request Body:**
\`\`\`json
{
  "address": "0xSuspicious...",
  "label": "Suspicious Contract"
}
\`\`\`

### Remove from List

\`\`\`http
DELETE /api/policy/list/{type}/{address}
\`\`\`

**Path Parameters:**
- `type`: "allow" | "deny"
- `address`: The address to remove

---

## Transaction Execution

### Execute Transaction (via Quack x402)

\`\`\`http
POST /api/transaction/execute
\`\`\`

**Request Body:**
\`\`\`json
{
  "actionId": "action_123",
  "walletAddress": "0x742d...",
  "signature": "0x...",
  "network": "bnb-testnet"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "txHash": "0x1234567890abcdef...",
  "status": "pending",
  "explorerUrl": "https://testnet.bscscan.com/tx/0x1234..."
}
\`\`\`

### Get Transaction Status

\`\`\`http
GET /api/transaction/{txHash}/status
\`\`\`

**Response:**
\`\`\`json
{
  "txHash": "0x1234...",
  "status": "success" | "pending" | "failed",
  "blockNumber": 12345678,
  "gasUsed": "21000",
  "effectiveGasPrice": "5000000000"
}
\`\`\`

---

## Activity Log

### Get Activity History

\`\`\`http
GET /api/activity?limit=50&offset=0
\`\`\`

**Response:**
\`\`\`json
{
  "activities": [
    {
      "id": "act-1",
      "type": "research" | "audit" | "action" | "transaction",
      "title": "Token Research: PEPE",
      "description": "Analyzed PEPE token on BNB Chain",
      "timestamp": "2025-01-15T10:30:00Z",
      "txHash": null,
      "status": null
    }
  ],
  "total": 150,
  "hasMore": true
}
\`\`\`

---

## WebSocket Events

### Connection

\`\`\`javascript
const ws = new WebSocket('wss://api.quack.agent/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));
\`\`\`

### Event Types

**Streaming Response:**
\`\`\`json
{
  "type": "stream",
  "messageId": "msg_123",
  "content": "Analyzing",
  "done": false
}
\`\`\`

**Transaction Update:**
\`\`\`json
{
  "type": "tx_update",
  "txHash": "0x1234...",
  "status": "confirmed",
  "blockNumber": 12345678
}
\`\`\`

**Policy Alert:**
\`\`\`json
{
  "type": "policy_alert",
  "alert": "Spend cap reached for USDT"
}
\`\`\`

---

## Error Responses

All endpoints may return error responses in this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient USDT balance for this transfer",
    "details": {
      "required": "10",
      "available": "5"
    }
  }
}
\`\`\`

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or expired session token |
| `INVALID_ADDRESS` | Malformed wallet/contract address |
| `INSUFFICIENT_BALANCE` | Not enough tokens for operation |
| `SPEND_CAP_EXCEEDED` | Action exceeds spend cap limit |
| `DENIED_ADDRESS` | Target address is on deny list |
| `NETWORK_MISMATCH` | Wrong network for operation |
| `CONTRACT_NOT_FOUND` | Contract address not found on chain |
| `AUDIT_FAILED` | Unable to audit contract |
| `GAS_ESTIMATION_FAILED` | Could not estimate gas for transaction |

---

## Data Flow Diagrams

### Research Flow
\`\`\`
User Input → Parse Intent → ChainGPT Query → On-chain Data Fetch → Format Response → Stream to Client
\`\`\`

### Audit Flow
\`\`\`
Contract Address → Fetch Bytecode → Decompile → ChainGPT Analysis → Vulnerability Scan → Generate Report
\`\`\`

### Action Flow
\`\`\`
User Intent → Parse Parameters → Policy Check → Spend Cap Validation → Gas Estimation → Preview Generation → User Approval → Quack x402 Execution
\`\`\`

---

## Notes for Backend Implementation

1. **Streaming**: Use Server-Sent Events (SSE) for research and audit responses to show thinking steps.

2. **ChainGPT Integration**: Research and audit endpoints should integrate with ChainGPT's API for AI-powered analysis.

3. **Quack x402**: Transaction execution uses Quack's sign-to-pay system. Ensure proper integration with their SDK.

4. **Gas Sponsorship**: Implement gas sponsorship logic based on user tier and action type.

5. **Policy Enforcement**: All actions MUST be validated against user's policy (spend caps, allow/deny lists) before execution.

6. **Caching**: Cache token research data for 5 minutes, audit results for 1 hour (unless contract is modified).

7. **Rate Limiting**: Implement rate limits per endpoint:
   - Research: 20 requests/minute
   - Audit: 10 requests/minute
   - Actions: 30 requests/minute
   - Transactions: 5 requests/minute
