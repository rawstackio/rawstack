import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
  async getData<T>(key: string): Promise<T | undefined> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : undefined;
    } catch (e) {
      // read error
    }
  }
  async setData(key: string, value?: object): Promise<void> {
    try {
      if (!value) {
        await AsyncStorage.removeItem(key);
        return;
      }

      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      // save error
    }
  }

  async setString(key: string, value?: string): Promise<void> {
    try {
      if (!value) {
        await AsyncStorage.removeItem(key);
        return;
      }

      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // save error
    }
  }

  async getString(key: string): Promise<string | undefined> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value || undefined;
    } catch (e) {
      // read error
    }
  }
}

const LocalStorageProvider = new LocalStorage();
export default LocalStorageProvider;
