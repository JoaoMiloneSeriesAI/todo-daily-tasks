import { IPlatformService } from './IPlatformService';
import { electronService } from './electronService';
import { capacitorService } from './capacitorService';

/// <summary>
/// Detects the current runtime platform based on global objects.
/// Returns 'electron' when window.electronAPI is available (desktop),
/// 'capacitor' when the Capacitor bridge is present (mobile),
/// or 'web' for plain browser environments.
/// </summary>
function detectPlatform(): 'electron' | 'capacitor' | 'web' {
  if (typeof window !== 'undefined' && (window as any).electronAPI) return 'electron';
  if (typeof window !== 'undefined' && (window as any).Capacitor) return 'capacitor';
  return 'web';
}

/// <summary>
/// Factory that creates the appropriate IPlatformService implementation
/// based on the detected runtime platform.
/// </summary>
function createPlatformService(): IPlatformService {
  const platform = detectPlatform();

  switch (platform) {
    case 'electron':
      return electronService;

    case 'capacitor':
      return capacitorService;

    default:
      // Fallback to Electron service (has browser-mode guards that return safe defaults)
      console.warn('Unknown platform, falling back to Electron service with browser-mode guards');
      return electronService;
  }
}

/// <summary>
/// The singleton platform service instance used throughout the app.
/// All stores and components should import this instead of ipcService directly.
/// </summary>
export const platformService: IPlatformService = createPlatformService();
