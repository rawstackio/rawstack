import Cookies from 'universal-cookie';

class LocalStorage {
    private cookies = new Cookies(null, { path: '/' });
    getData<T>(key: string): T | undefined {
        try {
            return this.cookies.get(key);
        } catch (e) {
            // read error
        }
    }
    setData(key: string, value?: object): void {
        try {
            if (!value) {
                this.cookies.remove(key);
                return;
            }

            const jsonValue = JSON.stringify(value);
            this.cookies.set(key, jsonValue);
        } catch (e) {
            // save error
        }
    }

    setString(key: string, value?: string): void {
        try {
            if (!value) {
                this.cookies.remove(key);
                return;
            }

            this.cookies.set(key, value);
        } catch (e) {
            // save error
        }
    }

    getString(key: string): string | undefined {
        try {
            const value = this.cookies.get(key);
            return value || undefined;
        } catch (e) {
            // read error
        }
    }
}

const LocalStorageProvider = new LocalStorage();
export default LocalStorageProvider;
