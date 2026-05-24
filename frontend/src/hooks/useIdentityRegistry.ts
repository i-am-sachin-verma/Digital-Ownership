import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID, ABIS } from '../constants/contracts';

export const useIdentityRegistry = () => {
  const { provider, signer, chainId } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get contract instance
  const getContract = useCallback((useSigner = false) => {
    if (!provider) throw new Error("Wallet not connected");
    const activeChainId = chainId || DEFAULT_CHAIN_ID;
    const address = CONTRACT_ADDRESSES[activeChainId]?.SovereignIdentityRegistry;
    
    if (!address) throw new Error(`Contract not deployed on chain ${activeChainId}`);
    
    return new Contract(
      address, 
      ABIS.SovereignIdentityRegistry, 
      useSigner ? signer : provider
    );
  }, [provider, signer, chainId]);

  const isRegistered = useCallback(async (address: string): Promise<boolean> => {
    try {
      const contract = getContract(false);
      return await contract.isRegistered(address);
    } catch (err: any) {
      console.error("isRegistered error:", err);
      return false;
    }
  }, [getContract]);

  const getHash = useCallback(async (address: string): Promise<string | null> => {
    try {
      const contract = getContract(false);
      const isReg = await contract.isRegistered(address);
      if (!isReg) return null;
      
      return await contract.getIdentityHash(address);
    } catch (err: any) {
      console.error("getHash error:", err);
      return null;
    }
  }, [getContract]);

  const verify = useCallback(async (address: string, hash: string): Promise<boolean> => {
    try {
      const contract = getContract(false);
      return await contract.verifyIdentity(address, hash);
    } catch (err: any) {
      console.error("verify error:", err);
      return false;
    }
  }, [getContract]);

  const register = useCallback(async (hash: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const contract = getContract(true);
      const tx = await contract.registerIdentity(hash);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err: any) {
      console.error("register error:", err);
      setError(err.reason || err.message || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer]);

  return {
    isRegistered,
    getHash,
    verify,
    register,
    loading,
    error
  };
};
