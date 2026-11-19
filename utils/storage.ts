
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save application data as JSON.
 */
export async function saveData<T>(
  key: string,
  data: T
): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
}

/**
 * Load application data.
 * Returns the supplied fallback when no saved data exists.
 */
export async function loadData<T>(
  key: string,
  fallback: T
): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue === null) {
      return fallback;
    }

    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
}

/**
 * Remove saved application data.
 */
export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

/**
 * CollabFlow storage keys.
 */
export const STORAGE_KEYS = {
  TASKS: '@collabflow/tasks',
  TASK_COMMENTS: '@collabflow/task_comments',
  TASK_ESCALATIONS: '@collabflow/task_escalations',
  NOTIFICATIONS: '@collabflow/notifications',
  REPORTING_LINES: '@collabflow/reporting_lines',
  ROLES: '@collabflow/roles',
  CHANNELS: '@collabflow/channels',
};
