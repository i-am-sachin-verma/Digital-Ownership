import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { withRetry } from '../lib/transactionUtils';
import contractHelpers from '../lib/contractHelpers';
import { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID, ABIS } from '../constants/contracts';

export const useCoreLogic = () => {
  const { provider, signer, chainId } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback((useSigner = false) => {
    if (!provider) throw new Error("Wallet not connected");
    const activeChainId = chainId || DEFAULT_CHAIN_ID;
    const address = CONTRACT_ADDRESSES[activeChainId]?.CoreLogic;
    if (!address) throw new Error(`Contract not deployed on chain ${activeChainId}`);
    
    return new Contract(address, ABIS.CoreLogic, useSigner ? signer : provider);
  }, [provider, signer, chainId]);

  const getData = useCallback(async (id: number): Promise<string | null> => {
    const cacheKey = `data-${id}-${chainId}`;
    const cached = contractHelpers.getItem1(cacheKey);
    if (cached) return cached.value;

    try {
      const contract = getContract(false);
      const value = await contract.getData(id);
      if (value) {
        contractHelpers.saveItem1(cacheKey, { id, value, createdAt: Date.now() });
      }
      return value;
    } catch (err) {
      console.error("getData error:", err);
      return null;
    }
  }, [getContract, chainId]);

  const setData = useCallback(async (id: number, value: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const contract = getContract(true);
      
      const tx = await withRetry(() => contract.setData(id, value));
      const receipt = await tx.wait();
      
      contractHelpers.invalidate(`data-${id}-${chainId}`);
      return receipt.hash;
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, chainId]);

  return { getData, setData, loading, error };
};