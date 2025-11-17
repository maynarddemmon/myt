module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  globals: {
    window: "readonly",
    document: "readonly",
    global: "readonly",
    console: "readonly",
    exports: "readonly",
    fetch: "readonly",
    JS: "readonly",
    myt: "readonly",
    atob: "readonly",
    Blob: "readonly",
	test: "readonly",
	ok: "readonly",
	BrowserDetect: "readonly",
	QUnit: "readonly",
	tym: "readonly"
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": ["warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }],
    "no-undef": "warn",
    "no-extra-boolean-cast": "off", // if (!!someVar) {   // }
    "no-constant-condition": ["warn", { "checkLoops": false }], // while (true) {}
    "no-useless-escape": "off",
  },
};
