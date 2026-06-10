import { useState, useEffect } from 'react';

const DEFAULT_COOLING_HOURS = 48;

export function useBreakupTimer(breakupInitiatedAt, coolingHours = DEFAULT_COOLING_HOURS) {
  const deadline = breakupInitiatedAt
    ? new Date(new Date(breakupInitiatedAt).getTime() + coolingHours * 3600 * 1000)
    : null;

  const compute = () => {
    if (!deadline) return { total: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const totalSec = Math.floor(diff / 1000);
    return {
      total: diff,
      hours: Math.floor(totalSec / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
      expired: false,
    };
  };

  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    if (!deadline) {
      setRemaining(compute());
      return undefined;
    }
    const id = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakupInitiatedAt, coolingHours]);

  return { ...remaining, deadline };
}

export default useBreakupTimer;