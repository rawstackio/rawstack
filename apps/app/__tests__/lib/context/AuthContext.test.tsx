import React, { act, useContext } from 'react';
import TestRenderer from 'react-test-renderer';
import AuthProvider, { AuthContext, AuthData } from '../../../src/lib/context/AuthContext';
import { ApiError } from '../../../src/lib/api/exception/errors';
import UserModel from '../../../src/lib/model/UserModel';

jest.mock('../../../src/lib/api/Api', () => ({
  __esModule: true,
  default: {
    auth: { createToken: jest.fn() },
    user: { getCurrentUser: jest.fn() },
    init: jest.fn(),
  },
}));

jest.mock('../../../src/lib/storage/localStorage', () => ({
  __esModule: true,
  default: {
    getData: jest.fn(),
    setData: jest.fn(),
  },
}));

// Lazy-require the mocks so jest.mock hoisting works correctly
const getApi = () =>
  require('../../../src/lib/api/Api').default as {
    auth: { createToken: jest.Mock };
    user: { getCurrentUser: jest.Mock };
    init: jest.Mock;
  };

const getStorage = () =>
  require('../../../src/lib/storage/localStorage').default as {
    getData: jest.Mock;
    setData: jest.Mock;
  };

// Minimal renderHook implementation using react-test-renderer
function renderAuthHook() {
  let contextValue = {} as ReturnType<typeof useContext<typeof AuthContext>>;

  const TestConsumer = () => {
    contextValue = useContext(AuthContext);
    return null;
  };

  let renderer!: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
  });

  return {
    result: {
      get current() {
        return contextValue as any;
      },
    },
    unmount: () =>
      act(() => {
        renderer.unmount();
      }),
  };
}

const tokenResponse = {
  data: {
    item: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    },
  },
};

const userResponse = {
  data: {
    item: {
      id: 'user-1',
      email: 'test@example.com',
      roles: ['VERIFIED_USER'],
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  getStorage().getData.mockResolvedValue(undefined);
  getStorage().setData.mockResolvedValue(undefined);
});

describe('login', () => {
  it('authenticates with email and password, fetches user, and sets state', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' });
    });

    expect(getApi().auth.createToken).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password1!',
    });
    expect(getApi().user.getCurrentUser).toHaveBeenCalled();
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('normalises email to lowercase before sending', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'TEST@EXAMPLE.COM', password: 'Password1!' });
    });

    expect(getApi().auth.createToken).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });

  it('authenticates with a refresh token', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', refreshToken: 'my-refresh' });
    });

    expect(getApi().auth.createToken).toHaveBeenCalledWith({
      email: 'test@example.com',
      refreshToken: 'my-refresh',
    });
  });

  it('skips fetchUser when a user model is pre-supplied', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    const preSupplied = new UserModel('user-1', 'test@example.com', ['VERIFIED_USER']);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' }, preSupplied);
    });

    expect(getApi().user.getCurrentUser).not.toHaveBeenCalled();
    expect(result.current.user).toBe(preSupplied);
  });

  it('calls Api.init with the returned tokens on success', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' });
    });

    expect(getApi().init).toHaveBeenCalledWith(
      'access-token',
      expect.objectContaining({ token: 'refresh-token', email: 'test@example.com' }),
      expect.any(Function),
    );
  });

  it('throws AuthenticationError when the API returns 401', async () => {
    getApi().auth.createToken.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials'));

    const { result } = renderAuthHook();

    await act(async () => {
      await expect(result.current.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  it('clears stored auth data when a refresh token login fails', async () => {
    getApi().auth.createToken.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Token expired'));

    const { result } = renderAuthHook();

    await act(async () => {
      await expect(result.current.login({ email: 'test@example.com', refreshToken: 'expired' })).rejects.toThrow();
    });

    expect(getStorage().setData).toHaveBeenCalledWith('authData', undefined);
  });
});

describe('logout', () => {
  it('clears user state, wipes auth storage, and resets Api', async () => {
    getApi().auth.createToken.mockResolvedValue(tokenResponse);
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' });
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeUndefined();
    expect(getStorage().setData).toHaveBeenCalledWith('authData', undefined);
    expect(getApi().init).toHaveBeenCalledWith(undefined, undefined, undefined);
  });
});

describe('refreshUser', () => {
  it('re-fetches the current user and updates state', async () => {
    getApi().user.getCurrentUser.mockResolvedValue(userResponse);

    const { result } = renderAuthHook();

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.email).toBe('test@example.com');
  });
});

describe('getAuthItems', () => {
  it('returns stored auth data', async () => {
    const stored: AuthData = {
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: '2099-01-01T00:00:00Z',
      userEmail: 'test@example.com',
    };
    getStorage().getData.mockResolvedValue(stored);

    const { result } = renderAuthHook();

    let items: AuthData | undefined;
    await act(async () => {
      items = await result.current.getAuthItems();
    });

    expect(items).toEqual(stored);
  });

  it('returns undefined when nothing is stored', async () => {
    const { result } = renderAuthHook();

    let items: AuthData | undefined;
    await act(async () => {
      items = await result.current.getAuthItems();
    });

    expect(items).toBeUndefined();
  });
});

describe('modal controls', () => {
  it('opens and closes the auth modal', async () => {
    const { result } = renderAuthHook();

    await act(async () => {
      result.current.closeAuthModal();
    });
    expect(result.current.authModalIsOpen).toBe(false);

    await act(async () => {
      result.current.openAuthModal();
    });
    expect(result.current.authModalIsOpen).toBe(true);
  });
});
