import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'tmp', 'dependency-cruiser.config.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true }, globals: globals.browser } },
  { files: ['src/**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks, 'react-refresh': refresh }, rules: { ...hooks.configs.recommended.rules, ...refresh.configs.vite.rules, complexity: ['error', 12], 'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }] } },
  { files: ['*.js'], ...tseslint.configs.disableTypeChecked }
);
