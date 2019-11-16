module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  plugins: [
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "allowImportExportEverywhere": true
  },
  rules: {
    // window风格的换行(而非unix)
    "linebreak-style": ["error", "windows"],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "semi": ["error", "never"],
    "no-await-in-loop": "off",
    "no-underscore-dangle": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off",
    "import/prefer-default-export": "off",
    "max-len": "off",
  },
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [ ".ts", ".js" ],
      }
    }
  }
}
