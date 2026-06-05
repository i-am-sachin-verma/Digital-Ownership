# Digital Ownership Frontend

The user interface for managing decentralized identities, built with React and Vite.

## Getting Started

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and provide the required contract addresses.

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Key Components

- **IdentityRegistry**: Interface for interacting with the identity smart contracts.
- **AccessManager**: Handles client-side permission checks.
- **CredentialMinter**: UI for issuing verifiable on-chain credentials.
