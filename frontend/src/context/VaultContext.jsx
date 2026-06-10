import { createContext, useState, useEffect, useCallback } from 'react';
import * as vaultApi from '../api/vault';
import * as contributionApi from '../api/contributions';
import { useAuth } from '../hooks/useAuth';

export const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [vault, setVault] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [interestLog, setInterestLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshVault = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vaultApi.getMyVault();
      const v = res.data.vault;
      setVault(v);
      if (v) {
        try {
          const bal = await vaultApi.getBalance();
          setBalance(bal.data);
        } catch {
          /* balance is supplementary; ignore if it fails */
        }
      } else {
        setBalance(null);
      }
      return v;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContributions = useCallback(async (params) => {
    const res = await contributionApi.getHistory(params);
    const data = res.data;
    const list = Array.isArray(data) ? data : data?.items || data?.contributions || [];
    setContributions(list);
    return data;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshVault().catch(() => {});
    } else {
      setVault(null);
      setBalance(null);
      setContributions([]);
      setInterestLog([]);
    }
  }, [isAuthenticated, refreshVault]);

  const value = {
    vault,
    balance,
    contributions,
    interestLog,
    loading,
    refreshVault,
    refreshContributions,
    setVault,
    setInterestLog,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}