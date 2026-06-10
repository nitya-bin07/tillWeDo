import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as coupleApi from '../api/couple';
import { useAuth } from '../hooks/useAuth';

export const CoupleContext = createContext(null);

export function CoupleProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCouple = useCallback(async () => {
    setLoading(true);
    try {
      const res = await coupleApi.getMyCouple();
      setCouple(res.data.couple);
      return res.data.couple;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCouple().catch(() => {});
    } else {
      setCouple(null);
    }
  }, [isAuthenticated, refreshCouple]);

  let partner = null;
  if (couple && user) {
    const aId = couple.partnerA?._id || couple.partnerA;
    partner = String(aId) === String(user._id) ? couple.partnerB || null : couple.partnerA || null;
  }

  const value = {
    couple,
    partner,
    inviteCode: couple?.inviteCode || null,
    coupleStatus: couple?.status || null,
    loading,
    refreshCouple,
    setCouple,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used within a CoupleProvider');
  return ctx;
}