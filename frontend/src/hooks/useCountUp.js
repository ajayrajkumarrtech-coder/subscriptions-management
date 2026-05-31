import { useEffect, useState } from 'react';

export const useCountUp = (end, duration = 1200, enabled = true) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const target = Number(end) || 0;
    if (target === 0) {
      setValue(0);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(target);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, enabled]);

  return value;
};
