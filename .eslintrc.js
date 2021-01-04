module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: ['./tsconfig.json']
  },
  extends: [
    'airbnb-typescript/base',
  ],
  ignorePatterns: ['*.test.{js,ts}'],
  rules: {
    'no-param-reassign': 0,
    '@typescript-eslint/semi': [2, 'never'],
    'max-len': ['error', { code: 120, 'ignoreUrls': true }],
    'import/prefer-default-export': 0,
  },
}
