import {IntlFormatters, Formatters, CustomFormats, OnErrorFn} from './types';

import {getNamedFormat, filterProps} from './utils';
import {FormatError, ErrorCode} from 'intl-messageformat';
import {MessageFormatError} from './error';
import {
  IntlRelativeTimeFormatOptions,
  RelativeTimeFormat,
} from '@formatjs/ecma402-abstract';

const RELATIVE_TIME_FORMAT_OPTIONS: Array<
  keyof IntlRelativeTimeFormatOptions
> = ['numeric', 'style'];

function getFormatter(
  {
    locale,
    formats,
    onError,
  }: {
    locale: string;
    formats: CustomFormats;
    onError: OnErrorFn;
  },
  getRelativeTimeFormat: Formatters['getRelativeTimeFormat'],
  options: Parameters<IntlFormatters['formatRelativeTime']>[2] = {}
): RelativeTimeFormat {
  const {format} = options;

  const defaults =
    (!!format && getNamedFormat(formats, 'relative', format, onError)) || {};
  const filteredOptions = filterProps(
    options,
    RELATIVE_TIME_FORMAT_OPTIONS,
    defaults as IntlRelativeTimeFormatOptions
  );

  return getRelativeTimeFormat(locale, filteredOptions);
}

export function formatRelativeTime(
  config: {
    locale: string;
    formats: CustomFormats;
    onError: OnErrorFn;
  },
  getRelativeTimeFormat: Formatters['getRelativeTimeFormat'],
  value: Parameters<IntlFormatters['formatRelativeTime']>[0],
  unit?: Parameters<IntlFormatters['formatRelativeTime']>[1],
  options: Parameters<IntlFormatters['formatRelativeTime']>[2] = {}
): string {
  if (!unit) {
    unit = 'second';
  }
  const RelativeTimeFormat = (Intl as any).RelativeTimeFormat;
  if (!RelativeTimeFormat) {
    config.onError(
      new FormatError(
        `Intl.RelativeTimeFormat is not available in this environment.
Try polyfilling it using "@formatjs/intl-relativetimeformat"
`,
        ErrorCode.MISSING_INTL_API
      )
    );
  }
  try {
    return getFormatter(config, getRelativeTimeFormat, options).format(
      value,
      unit
    );
  } catch (e) {
    config.onError(
      new MessageFormatError('Error formatting relative time.', e)
    );
  }

  return String(value);
}
