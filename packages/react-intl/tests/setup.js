if (process.version.startsWith('v12')) {
  //   delete Intl.PluralRules;
  //   delete Intl.RelativeTimeFormat;
  delete Intl.NumberFormat
}
// require('@formatjs/intl-pluralrules/polyfill-locales');
// require('@formatjs/intl-relativetimeformat/polyfill-locales');
// require('@formatjs/intl-listformat/polyfill-locales');
require('@formatjs/intl-displaynames/polyfill-locales')
require('@formatjs/intl-numberformat/polyfill')
require('@formatjs/intl-numberformat/locale-data/en')
require('@formatjs/intl-numberformat/locale-data/es')
// add custom jest matchers from jest-dom
require('@testing-library/jest-dom/extend-expect')
