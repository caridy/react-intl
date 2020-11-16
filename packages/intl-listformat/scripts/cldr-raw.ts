import {extractLists, getAllLocales} from './extract-list';
import {join} from 'path';
import {outputJSONSync} from 'fs-extra';
import {ListPatternLocaleData} from '@formatjs/ecma402-abstract';
import minimist from 'minimist';

async function main(args: minimist.ParsedArgs) {
  const {outDir} = args;
  const locales = await getAllLocales();
  const data = await extractLists(locales);
  const langData = locales.reduce(
    (all: Record<string, ListPatternLocaleData>, locale) => {
      if (locale === 'en-US-POSIX') {
        all['en-US'] = {
          data: {
            ['en-US']: data[locale],
          },
          availableLocales: ['en-US'],
        };
      } else {
        all[locale] = {
          data: {
            [locale]: data[locale],
          },
          availableLocales: [locale],
        };
      }

      return all;
    },
    {}
  );
  Object.keys(langData).forEach(function (locale) {
    outputJSONSync(join(outDir, `${locale}.json`), langData[locale]);
  });
}

if (require.main === module) {
  (async () => main(minimist(process.argv)))();
}
