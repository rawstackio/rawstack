import { RequestIdProvider } from '~/common/infrastructure/logging/request-id-provider';

it('returns requestId from async local storage when present', () => {
  const als = { getStore: jest.fn().mockReturnValue({ requestId: 'abc-123' }) } as any;
  const provider = new RequestIdProvider(als);
  expect(provider.getRequestId()).toBe('abc-123');
});

it('returns empty string when async local storage store is undefined', () => {
  const als = { getStore: jest.fn().mockReturnValue(undefined) } as any;
  const provider = new RequestIdProvider(als);
  expect(provider.getRequestId()).toBe('');
});

it('returns empty string when requestId is missing in store', () => {
  const als = { getStore: jest.fn().mockReturnValue({}) } as any;
  const provider = new RequestIdProvider(als);
  expect(provider.getRequestId()).toBe('');
});
