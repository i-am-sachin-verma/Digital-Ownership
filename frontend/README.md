# Digital Ownership - Frontend UI

This is the frontend interface for the Digital Ownership sovereign identity platform, connecting users to the underlying CoreLogic and AccessController smart contracts.

## Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm

## Environment Setup
Create a `.env` file in the `frontend` directory and add the following variables. Use the contract addresses generated from your Foundry deployment:

VITE_RPC_URL="http://127.0.0.1:8545" # Or your live testnet RPC
VITE_CORE_LOGIC_ADDRESS="<Deployed_CoreLogic_Address>"
VITE_ACCESS_CONTROLLER_ADDRESS="<Deployed_AccessController_Address>"

## Installation & Running Locally
1. Install dependencies:
`npm install`
2. Start the development server:
`npm run dev`

The frontend uses these environment variables to establish a connection to the blockchain and interact with the deployed identity contracts.
