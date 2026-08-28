'use client';

import { useEffect } from 'react';

export default function IntroRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('intro_dismissed');
      if (!dismissed) {
        const introShown = localStorage.getItem('intro_shown');
        if (!introShown) {
          window.location.href = '/intro';
        }
      }
    }
  }, []);

  return null;
}
