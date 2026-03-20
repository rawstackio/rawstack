import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageProvider from '../../../src/lib/storage/localStorage';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LocalStorageProvider', () => {
  describe('setData', () => {
    it('serialises an object and stores it', async () => {
      const value = { id: '1', name: 'test' };
      await LocalStorageProvider.setData('key', value);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify(value));
    });

    it('removes the item when value is undefined', async () => {
      await LocalStorageProvider.setData('key', undefined);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('key');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getData', () => {
    it('parses and returns stored JSON', async () => {
      const value = { id: '1', name: 'test' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(value));
      const result = await LocalStorageProvider.getData('key');
      expect(result).toEqual(value);
    });

    it('returns undefined when the key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await LocalStorageProvider.getData('missing');
      expect(result).toBeUndefined();
    });

    it('returns undefined silently on a read error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read error'));
      const result = await LocalStorageProvider.getData('key');
      expect(result).toBeUndefined();
    });
  });

  describe('setString', () => {
    it('stores a string value directly', async () => {
      await LocalStorageProvider.setString('token', 'abc123');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    });

    it('removes the item when value is undefined', async () => {
      await LocalStorageProvider.setString('token', undefined);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getString', () => {
    it('returns the stored string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('abc123');
      const result = await LocalStorageProvider.getString('token');
      expect(result).toBe('abc123');
    });

    it('returns undefined when the key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await LocalStorageProvider.getString('missing');
      expect(result).toBeUndefined();
    });

    it('returns undefined silently on a read error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read error'));
      const result = await LocalStorageProvider.getString('token');
      expect(result).toBeUndefined();
    });
  });

  describe('round-trip', () => {
    it('stores and retrieves an object', async () => {
      const value = { user: 'dan', active: true };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(value));

      await LocalStorageProvider.setData('user', value);
      const result = await LocalStorageProvider.getData<typeof value>('user');
      expect(result).toEqual(value);
    });

    it('stores and retrieves a string', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('my-token');

      await LocalStorageProvider.setString('token', 'my-token');
      const result = await LocalStorageProvider.getString('token');
      expect(result).toBe('my-token');
    });
  });
});
