import SovereignIdentityRegistryABI from '../abis/SovereignIdentityRegistry.json';
import AccessControllerABI from '../abis/AccessController.json';
import CoreLogicABI from '../abis/CoreLogic.json';

export const SUPPORTED_CHAINS = {
  LOCALHOST: 31337,
  SEPOLIA: 11155111,
} as const;

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.LOCALHOST;

// These addresses will be updated after deployment in Phase 24
export const CONTRACT_ADDRESSES: Record<number, {
  SovereignIdentityRegistry: string;
  AccessController: string;
  CoreLogic: string;
}> = {
  [SUPPORTED_CHAINS.LOCALHOST]: {
    SovereignIdentityRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default anvil address 0
    AccessController: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Default anvil address 1
    CoreLogic: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Default anvil address 2
  },
  [SUPPORTED_CHAINS.SEPOLIA]: {
    SovereignIdentityRegistry: "", 
    AccessController: "",
    CoreLogic: "",
  }
};

export const ABIS = {
  SovereignIdentityRegistry: SovereignIdentityRegistryABI,
  AccessController: AccessControllerABI,
  CoreLogic: CoreLogicABI,
};
