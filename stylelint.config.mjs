const config = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['node_modules/**', '.next/**', 'out/**', 'src/styles/legacy.css'],
  rules: {
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'color-hex-length': null,
    'comment-empty-line-before': null,
    'comment-whitespace-inside': null,
    'custom-property-empty-line-before': null,
    'custom-property-pattern': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-empty-line-before': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'keyframes-name-pattern': null,
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global', 'local'] },
    ],
    'shorthand-property-no-redundant-values': null,
  },
};

export default config;
