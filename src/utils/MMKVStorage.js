import { MMKV } from 'react-native-mmkv';

export const AUTH_STORAGE_KEY = 'auth_data';

// Token expiration constants (in milliseconds)
export const DEFAULT_TOKEN_EXPIRY_DAYS = 30; // Default 30 days if not provided by API
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes buffer before actual expiry

/**
 * Calculate token expiration timestamp
 * @param {number} expiresIn - Expiration time in seconds (optional)
 * @returns {number} Expiration timestamp in milliseconds
 */
export const calculateTokenExpiry = (expiresIn = null) => {
  if (expiresIn) {
    // If expiresIn is provided in seconds, convert to milliseconds
    return Date.now() + (expiresIn * 1000);
  }
  // Default to 30 days if not provided
  return Date.now() + (DEFAULT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
};

/**
 * Check if token is expired
 * @param {number} expiresAt - Expiration timestamp in milliseconds
 * @returns {boolean} True if token is expired or will expire soon
 */
export const isTokenExpired = (expiresAt) => {
  if (!expiresAt) return true;
  // Check if token expires within buffer time (5 minutes)
  return Date.now() >= (expiresAt - TOKEN_EXPIRY_BUFFER_MS);
};

/**
 * Get valid auth data from storage (only if not expired)
 * @returns {object|null} Auth data if valid, null if expired or missing
 */
export const getValidAuthData = () => {
  const authData = getObject(AUTH_STORAGE_KEY);
  if (!authData || !authData.token) {
    return null;
  }

  // Check expiration
  if (authData.expiresAt && isTokenExpired(authData.expiresAt)) {
    console.log('Token expired, clearing auth data');
    removeItem(AUTH_STORAGE_KEY);
    return null;
  }

  return authData;
};

let storage = null;
let isRemoteDebugging = false;

try {
  storage = new MMKV();
} catch (error) {
  // Check if error is due to remote debugging
  const errorMessage = error?.message || String(error);
  isRemoteDebugging = errorMessage.includes('React Native is not running on-device') ||
    errorMessage.includes('JSI') ||
    errorMessage.includes('remote debugger');

  // Only warn if it's not a remote debugging issue
  if (!isRemoteDebugging) {
    console.warn(
      '[MMKV] Falling back to no-op storage. Reason:',
      errorMessage,
    );
  }
  // Silently handle remote debugging case - this is expected
  storage = null;
}

const ensureStorage = () => {
  if (!storage) {

    return false;
  }
  return true;
};

export const setItem = (key, value) => {
  if (!ensureStorage() || !storage) {
    return;
  }

  if (value === undefined || value === null) {
    try {
      storage.delete(key);
    } catch (error) {
      // Silently handle in remote debugging
    }
    return;
  }

  if (typeof value === 'string') {
    try {
      storage.set(key, value);
    } catch (error) {
      if (!isRemoteDebugging) {
        console.warn(`Failed to set MMKV item for key ${key}`, error);
      }
    }
    return;
  }

  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    if (!isRemoteDebugging) {
      console.warn(`Failed to set MMKV item for key ${key}`, error);
    }
  }
};

export const getItem = key => {
  if (!ensureStorage() || !storage) {
    return null;
  }

  try {
    const raw = storage.getString(key);
    if (!raw || raw === 'undefined' || raw === 'null' || typeof raw !== 'string') {
      return null;
    }
    return raw;
  } catch (error) {
    // Silently handle errors in remote debugging mode
    if (!isRemoteDebugging) {
      console.warn(`Failed to get MMKV item for key ${key}`, error);
    }
    return null;
  }
};

export const setObject = (key, value) => {
  if (!ensureStorage() || !storage) {
    return;
  }

  if (value === undefined || value === null) {
    try {
      storage.delete(key);
    } catch (error) {
      // Silently handle in remote debugging
    }
    return;
  }

  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    if (!isRemoteDebugging) {
      console.warn(`Failed to set MMKV object for key ${key}`, error);
    }
  }
};

export const getObject = key => {
  if (!ensureStorage() || !storage) {
    return null;
  }

  try {
    const raw = storage.getString(key);
    if (!raw || raw === 'undefined' || raw === 'null' || typeof raw !== 'string') {
      return null;
    }

    // Additional safety check - if raw value looks like "undefined" string
    const trimmed = raw.trim();
    if (trimmed === 'undefined' || trimmed === 'null' || trimmed.length === 0) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (parseError) {
      // Silently handle parse errors in remote debugging mode
      if (!isRemoteDebugging) {
        console.warn(`Failed to parse MMKV value for key ${key}. Raw: ${raw.substring(0, 50)}`, parseError);
      }
      return null;
    }
  } catch (error) {
    // Silently handle errors in remote debugging mode
    if (!isRemoteDebugging) {
      console.warn(`Failed to get MMKV value for key ${key}`, error);
    }
    return null;
  }
};

export const removeItem = key => {
  if (!ensureStorage() || !storage) {
    return;
  }

  try {
    storage.delete(key);
  } catch (error) {
    // Silently handle in remote debugging
    if (!isRemoteDebugging) {
      console.warn(`Failed to remove MMKV item for key ${key}`, error);
    }
  }
};
