module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: ['./tsconfig.json']
  },
  env: {
    node: true,
    jest: true
  },
  extends: [
    'airbnb-typescript/base',
  ],
  ignorePatterns: ['*.test.{js,ts,jsx,tsx}'],
  rules: {
    'no-param-reassign': 0,
    '@typescript-eslint/semi': [2, 'never'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-len': ['error', { code: 120, 'ignoreUrls': true }],
    'import/prefer-default-export': 0,
  },
}
