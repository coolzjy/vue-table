module.exports = {
  root: true,

  env: {
    browser: true,
  },

  extends: ['standard', 'standard-jsx'],

  rules: {
    'jsx-quotes': [2, 'prefer-double'],

    'max-len': [2, {
      "code": 80,
      "ignoreComments": true,
      "ignoreStrings": true,
      "ignoreRegExpLiterals": true
    }],

    'arrow-parens': 0,

    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
