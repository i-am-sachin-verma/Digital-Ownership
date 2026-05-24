import { useContext, useCallback } from 'react';
import { WalletContext } from '../context/WalletContext';
import { DEFAULT_CHAIN_ID } from '../constants/contracts';

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  // Helper to request network switch if wrong network
  const switchNetwork = useCallback(async (targetChainId: number = DEFAULT_CHAIN_ID) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        console.error("Network not found in MetaMask. Please add it manually.");
      } else {
        console.error("Failed to switch network:", switchError);
      }
    }
  }, []);

  return {
    ...context,
    switchNetwork
  };
};
