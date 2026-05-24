import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID, ABIS } from '../constants/contracts';

export const useCoreLogic = () => {
  const { provider, signer, chainId } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get contract instance
  const getContract = useCallback((useSigner = false) => {
    if (!provider) throw new Error("Wallet not connected");
    const activeChainId = chainId || DEFAULT_CHAIN_ID;
    const address = CONTRACT_ADDRESSES[activeChainId]?.CoreLogic;
    
    if (!address) throw new Error(`Contract not deployed on chain ${activeChainId}`);
    
    return new Contract(
      address, 
      ABIS.CoreLogic, 
      useSigner ? signer : provider
    );
  }, [provider, signer, chainId]);

  const getData = useCallback(async (id: number): Promise<string | null> => {
    try {
      const contract = getContract(false);
      return await contract.getData(id);
    } catch (err: any) {
      console.error("getData error:", err);
      // Might revert if ID doesn't exist depending on contract implementation
      return null;
    }
  }, [getContract]);

  const setData = useCallback(async (id: number, value: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const contract = getContract(true);
      const tx = await contract.setData(id, value);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (err: any) {
      console.error("setData error:", err);
      setError(err.reason || err.message || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer]);

  return {
    getData,
    setData,
    loading,
    error
  };
};
