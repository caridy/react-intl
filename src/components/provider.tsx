/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as React from 'react';
import withIntl, {Provider, WrappedComponentProps} from './injectIntl';

import * as invariant_ from 'invariant';
// Since rollup cannot deal with namespace being a function,
// this is to interop with TypeScript since `invariant`
// does not export a default
// https://github.com/rollup/rollup/issues/1267
const invariant = invariant_;
import {
  createError,
  filterProps,
  DEFAULT_INTL_CONFIG,
  createDefaultFormatters,
} from '../utils';
import {IntlConfig, IntlShape, IntlFormatters} from '../types';
import {formatters} from '../format';
import areIntlLocalesSupported from 'intl-locales-supported';
import * as shallowEquals_ from 'shallow-equal/objects';
const shallowEquals = shallowEquals_;

const intlConfigPropNames: Array<keyof IntlConfig> = [
  'locale',
  'timeZone',
  'formats',
  'messages',
  'textComponent',

  'defaultLocale',
  'defaultFormats',

  'onError',
];

function getConfig(filteredProps: OptionalIntlConfig): IntlConfig {
  let config: IntlConfig = {
    ...DEFAULT_INTL_CONFIG,
    ...filteredProps,
  };

  // Apply default props. This must be applied last after the props have
  // been resolved and inherited from any <IntlProvider> in the ancestry.
  // This matches how React resolves `defaultProps`.
  for (const propName in DEFAULT_INTL_CONFIG) {
    if (config[propName as 'timeZone'] === undefined) {
      config[propName as 'timeZone'] =
        DEFAULT_INTL_CONFIG[propName as 'timeZone'];
    }
  }

  if (!config.locale || !areIntlLocalesSupported(config.locale)) {
    const {locale, defaultLocale, defaultFormats, onError} = config;
    if (typeof onError === 'function')
      onError(
        createError(
          `Missing locale data for locale: "${locale}". ` +
            `Using default locale: "${defaultLocale}" as fallback.`
        )
      );

    // Since there's no registered locale data for `locale`, this will
    // fallback to the `defaultLocale` to make sure things can render.
    // The `messages` are overridden to the `defaultProps` empty object
    // to maintain referential equality across re-renders. It's assumed
    // each <FormattedMessage> contains a `defaultMessage` prop.
    config = {
      ...config,
      locale: defaultLocale,
      formats: defaultFormats,
      messages: DEFAULT_INTL_CONFIG.messages,
    };
  }

  return config;
}

function getBoundFormatFns(config: IntlConfig, state: State): IntlFormatters {
  const formatterState = {...state.context.formatters};

  return {
    formatNumber: formatters.formatNumber.bind(
      undefined,
      config,
      formatterState
    ),
    formatRelativeTime: formatters.formatRelativeTime.bind(
      undefined,
      config,
      formatterState
    ),
    formatDate: formatters.formatDate.bind(undefined, config, formatterState),
    formatTime: formatters.formatTime.bind(undefined, config, formatterState),
    formatPlural: formatters.formatPlural.bind(
      undefined,
      config,
      formatterState
    ),
    formatMessage: formatters.formatMessage.bind(
      undefined,
      config,
      formatterState
    ),
    formatHTMLMessage: formatters.formatHTMLMessage.bind(
      undefined,
      config,
      formatterState
    ),
  };
}

interface State {
  context: IntlShape;
  filteredProps?: IntlConfig;
}

type OptionalIntlConfig = Omit<IntlConfig, keyof typeof DEFAULT_INTL_CONFIG> &
  Partial<typeof DEFAULT_INTL_CONFIG>;

type ResolvedProps = WrappedComponentProps & OptionalIntlConfig;

class IntlProvider extends React.PureComponent<ResolvedProps, State> {
  constructor(props: ResolvedProps) {
    super(props);

    invariant(
      typeof Intl !== 'undefined',
      '[React Intl] The `Intl` APIs must be available in the runtime, ' +
        'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' +
        'See: http://formatjs.io/guides/runtime-environments/'
    );

    const {intl: intlContext} = props;

    // Creating `Intl*` formatters is expensive. If there's a parent
    // `<IntlProvider>`, then its formatters will be used. Otherwise, this
    // memoize the `Intl*` constructors and cache them for the lifecycle of
    // this IntlProvider instance.
    const {formatters = createDefaultFormatters()} = intlContext || {};

    this.state = {
      context: {
        ...intlContext!,
        formatters,
      },
    };
  }

  static getDerivedStateFromProps(nextProps: ResolvedProps, prevState: State) {
    const {intl: intlContext} = nextProps;

    // Build a whitelisted config object from `props`, defaults, and
    // `props.intl`, if an <IntlProvider> exists in the ancestry.
    const filteredProps = filterProps(
      nextProps,
      intlConfigPropNames,
      intlContext || {}
    );

    if (!shallowEquals(filteredProps, prevState.filteredProps)) {
      const config = getConfig(filteredProps);
      const boundFormatFns = getBoundFormatFns(config, prevState);

      return {
        filteredProps,
        context: {
          ...prevState.context,
          ...config,
          ...boundFormatFns,
        },
      };
    }

    return null;
  }

  render() {
    return (
      <Provider value={this.state.context}>{this.props.children}</Provider>
    );
  }
}

export default withIntl(IntlProvider, {enforceContext: false}); // to be able to inherit values from parent providers
