# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing, which is a fast and modern testing framework designed for Vite projects.

### Running Tests

```bash
# Run tests in watch mode (interactive)
yarn test

# Run tests once (CI mode)
yarn test:run

# Run tests with UI
yarn test:ui

# Run tests with coverage report
yarn test:coverage
```

### Writing Tests

Test files should be placed next to the files they test with a `.test.ts` or `.test.tsx` extension. For example:
- `user-model.ts` → `user-model.test.ts`
- `utils.ts` → `utils.test.ts`

Example test structure:
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myFile'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedValue)
  })
})
```

### Test Coverage

Currently, we have unit tests for the following non-component files:
- `src/lib/model/user-model.ts` - Model classes with business logic
- `src/lib/utils.ts` - Utility functions (cn for className merging)
- `src/lib/api/exception/errors.ts` - Custom error classes
- `src/lib/storage/local-storage.ts` - LocalStorage wrapper

### Test Configuration

Test configuration can be found in:
- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Test environment setup and global test utilities

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
