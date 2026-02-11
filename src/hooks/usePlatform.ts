import { useState, useEffect } from 'react';

export type Platform = 'electron' | 'capacitor' | 'web';

/// <summary>
/// Detects the current runtime platform.
/// Returns 'electron' for desktop, 'capacitor' for mobile, 'web' for browser.
/// </summary>
export function detectPlatform(): Platform {
  if (typeof window !== 'undefined' && (window as any).electronAPI) return 'electron';
  if (typeof window !== 'undefined' && (window as any).Capacitor) return 'capacitor';
  return 'web';
}

/// <summary>
/// Returns true if the app is running on a mobile platform (Capacitor).
/// </summary>
export function isMobilePlatform(): boolean {
  return detectPlatform() === 'capacitor';
}

/// <summary>
/// React hook that provides the current platform identifier.
/// </summary>
export function usePlatform(): Platform {
  return detectPlatform();
}

/// <summary>
/// React hook that returns true when on mobile (Capacitor).
/// </summary>
export function useIsMobile(): boolean {
  return detectPlatform() === 'capacitor';
}

/// <summary>
/// React hook that returns the current screen orientation.
/// Listens for orientation changes and re-renders the component.
/// </summary>
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return orientation;
}
