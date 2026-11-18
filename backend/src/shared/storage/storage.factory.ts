// src/shared/storage/storage.factory.ts

import type { StorageDriver } from './storage.interface.js';
import {LocalDriver} from './local.driver.js';

import {env} from '../../config/env.js';

// import { S3Driver } from './s3.driver.js'; // Tương lai

export type StorageDriverType = 'local' | 's3' | 'r2';

let currentDriver: StorageDriver | null = null;

export function initStorageDriver(type: StorageDriverType = 'local'): StorageDriver {
  if (currentDriver) return currentDriver;

  switch (type) {
    case 'local':
      currentDriver = new LocalDriver(
        env.STORAGE_LOCAL_PATH,
        env.STORAGE_PUBLIC_URL
      );
      break;
    // case 's3':
    //   currentDriver = new S3Driver({ ... });
    //   break;
    default:
      throw new Error(`Unsupported storage driver: ${type}`);
  }

  return currentDriver;
}

export function getStorageDriver(): StorageDriver {
  if (!currentDriver) {
    throw new Error('Storage driver not initialized. Call initStorageDriver() first.');
  }
  return currentDriver;
}