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
}

const LocalStorageProvider = new LocalStorage();
export default LocalStorageProvider;
