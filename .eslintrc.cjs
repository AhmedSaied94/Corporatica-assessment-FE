module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "standard",
    "plugin:react/recommended"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "react",
    "react-hooks"
  ],
  rules: {
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    "no-unused-vars": ["error", { args: "none" }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-tabs": "off",
    camelcase: "off",
    "react/display-name": "off"
  },
  settings: {
    react: {
      createClass: "createReactClass",
      // Regex for Component Factory to use,
      // default to "createReactClass"
      pragma: "React",
      // Pragma to use, default to "React"
      fragment: "Fragment",
      // Fragment to use (may be a property of <pragma>), default to "Fragment"
      version: "detect",
      // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // default to latest and warns if missing
      // It will default to "detect" in the future
      flowVersion: "0.53"
      // Flow version
    },
    propWrapperFunctions: [
      // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
      "forbidExtraProps",
      {
        property: "freeze",
        object: "Object"
      },
      {
        property: "myFavoriteWrapper"
      }
    ],
    componentWrapperFunctions: [
      // The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
      "observer",
      // `property`
      {
        property: "styled"
      },
      // `object` is optional
      {
        property: "observer",
        object: "Mobx"
      },
      {
        property: "observer",
        object: "<pragma>"
      }
      // sets `object` to whatever value `settings.react.pragma` is set to
    ],
    linkComponents: [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      "Hyperlink",
      {
        name: "Link",
        linkAttribute: "to"
      }
    ],
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    "sort-imports": ["error", {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      allowSeparatedGroups: false
    }]
  }

};
