/// <summary>
/// Backward-compatibility re-export.
/// All new code should import from platformService directly.
/// This file re-exports platformService as ipcService so existing consumers
/// continue to work without modification during the migration.
/// </summary>
import { platformService } from './platformService';

export const ipcService = platformService;
