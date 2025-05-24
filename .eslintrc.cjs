module.exports = {
  env: {
    browser: true,
    node: true, // penting untuk akses `process`
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // custom rules di sini
  },
}
