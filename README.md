# Digital Ownership
A sovereign identity platform powered by smart contracts.

## Prerequisites
- [Foundry](https://book.getfoundry.sh/)
- Node.js (v18 or higher)
- Git

## Smart Contract Setup
1. Clone the repository and navigate to the root directory.
2. Install dependencies (if applicable): `forge install`
3. Compile the contracts: `forge build`
4. Run the test suite: `forge test`

## Deployment
To deploy the core contracts (`CoreLogic.sol` and `AccessController.sol`), you will need a valid RPC URL and a private key. 

Run the deployment script (replace the placeholders with your actual script name and variables):
`forge script script/Deploy.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast`

Make sure to save the deployed contract addresses, as they will be needed for the frontend environment setup.
