export const validation = {
  email: {
    required: {
      value: true,
      message: 'Email is required',
    },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'A valid email is required',
    },
  },
  password: {
    required: {
      value: true,
      message: 'Password is required',
    },
  },
};
