
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    quotes: ['error', 'single'],
    indent: ['error', 2, {
      SwitchCase: 1,
    }],

    // easy fixes in near-term
    '@typescript-eslint/no-unused-vars': 'off',

    // hard fixes in long-term
    'prefer-const': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // legitimately want disabled
    '@typescript-eslint/no-empty-interface': 'off', // need empty interfaces for decl merging
    '@typescript-eslint/no-non-null-assertion': 'off',

    // TODO: merge rules from this legacy file:
    // https://github.com/fullcalendar/fullcalendar/blob/v5.11.3/.eslintrc.yml
  }
}
