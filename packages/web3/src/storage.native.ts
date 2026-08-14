import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Storage } from "@reown/appkit-react-native";

export const appKitStorage: Storage = {
  async getKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  },
  async getEntries<T = unknown>(): Promise<[string, T][]> {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.map(([key, value]) => [key, value ? (JSON.parse(value) as T) : (undefined as T)]);
  },
  async getItem<T = unknown>(key: string): Promise<T | undefined> {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  },
  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
};
