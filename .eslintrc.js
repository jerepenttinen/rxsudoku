module.exports = {
  extends: [
    // By extending from a plugin config, we can get recommended rules without having to add them manually.
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
    // This disables the formatting rules in ESLint that Prettier is going to be responsible for handling.
    // Make sure it's always the last config, so it gets the chance to override other configs.
    "eslint-config-prettier",
    "plugin:import/typescript",
  ],
  settings: {
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use.
      version: "detect",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: "./"
    },
    // Tells eslint how to resolve imports
    "import/resolver": {
      typescript: {},
      // node: {
      //   paths: ["src"],
      //   extensions: [".js", ".jsx", ".ts", ".tsx"],
      // },
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    quotes: [2, "double", "avoid-escape"],
  },
};
