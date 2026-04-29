import Cookies from 'universal-cookie';

class LocalStorage {
  private cookies = new Cookies(null, { path: '/' });

  getData<T>(key: string): T | undefined {
    return this.cookies.get(key);
  }
  setData(key: string, value?: object): void {
    if (!value) {
      this.cookies.remove(key);
      return;
    }

    const jsonValue = JSON.stringify(value);
    this.cookies.set(key, jsonValue);
  }

  setString(key: string, value?: string): void {
    if (!value) {
      this.cookies.remove(key);
      return;
    }

    this.cookies.set(key, value);
  }

  getString(key: string): string | undefined {
    const value = this.cookies.get(key);
    return value || undefined;
  }
}

const LocalStorageProvider = new LocalStorage();
export default LocalStorageProvider;
