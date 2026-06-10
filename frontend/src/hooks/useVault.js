import { useContext } from 'react';
import { VaultContext } from '../context/VaultContext';

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within a VaultProvider');
  return ctx;
}

export default useVault;