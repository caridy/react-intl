import * as React from 'react';
import {mount} from 'enzyme';
import IntlProvider, {Props} from '../../../src/components/provider';
import {WithIntlProps} from '../../../src/components/injectIntl';
import {IntlShape} from '../../../src/types';
import withIntl, {Provider} from '../../../src/components/injectIntl';

describe('<IntlProvider>', () => {
  const now = Date.now();

  const INTL_CONFIG_PROP_NAMES = [
    'locale',
    'timeZone',
    'formats',
    'textComponent',
    'messages',
    'defaultLocale',
    'defaultFormats',
    'onError',
  ];
  const INTL_FORMAT_PROP_NAMES = [
    'formatDate',
    'formatTime',
    'formatRelativeTime',
    'formatNumber',
    'formatPlural',
    'formatMessage',
    'formatHTMLMessage',
  ];

  class Child extends React.Component<any> {
    render() {
      return 'foo';
    }
  }

  const IntlChild = withIntl(Child);

  let consoleError;
  let dateNow;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    consoleError.mockRestore();
    dateNow.mockRestore();
  });

  it('has a `displayName`', () => {
    expect(IntlProvider.displayName).toBeA('string');
  });

  it('warns when no `locale` prop is provided', () => {
    mount(
      <IntlProvider locale={undefined}>
        <IntlChild />
      </IntlProvider>
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toContain(
      '[React Intl] Missing locale data for locale: "undefined". Using default locale: "en" as fallback.'
    );
  });

  it('warns when `locale` prop provided has no locale data', () => {
    const locale = 'missing';
    mount(
      <IntlProvider locale={locale}>
        <IntlChild />
      </IntlProvider>
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toContain(
      `[React Intl] Missing locale data for locale: "${locale}". Using default locale: "en" as fallback.`
    );
  });

  it('renders its `children`', () => {
    const el = (
      <IntlProvider locale="en">
        <IntlChild />
      </IntlProvider>
    );

    const rendered = mount(el);
    expect(rendered.children().length).toBe(1);
    expect(rendered.children().contains(<IntlChild />)).toBe(true);
  });

  it('provides `context.intl` with values from intl config props', () => {
    const props: WithIntlProps<Props> = {
      locale: 'fr-FR',
      timeZone: 'UTC',
      formats: {},
      messages: {},
      textComponent: 'span',

      defaultLocale: 'en-US',
      defaultFormats: {},

      onError: consoleError,
    };

    const rendered = mount(
      <IntlProvider {...props}>
        <IntlChild />
      </IntlProvider>
    );

    const intl = rendered.find(Child).prop('intl');

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).toBe(props[propName]);
    });
  });

  it('provides `context.intl` with timeZone from intl config props when it is specified', () => {
    const props = {
      locale: 'en',
      timeZone: 'Europe/Paris',
    };

    const intl: IntlShape = mount(
      <IntlProvider {...props}>
        <IntlChild />
      </IntlProvider>
    )
      .find(Child)
      .prop('intl');
    expect(intl.timeZone).toBe('Europe/Paris');
  });

  it('provides `context.intl` with values from `defaultProps` for missing or undefined props', () => {
    const props = {
      locale: 'en-US',
      defaultLocale: undefined,
    };

    const intl: IntlShape = mount(
      <IntlProvider {...props}>
        <IntlChild />
      </IntlProvider>
    )
      .find(Child)
      .prop('intl');

    expect(intl.defaultLocale).not.toBe(undefined);
    expect(intl.defaultLocale).toBe('en');
    expect(intl.messages).not.toBe(undefined);
    expect(intl.messages).toBeAn('object');
  });

  it('provides `context.intl` with format methods bound to intl config props', () => {
    const intl: IntlShape = mount(
      <IntlProvider
        locale="en"
        formats={{
          date: {
            'year-only': {
              year: 'numeric',
            },
          },
        }}
      >
        <IntlChild />
      </IntlProvider>
    )
      .find(Child)
      .prop('intl');

    INTL_FORMAT_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).toBeDefined();
      expect(intl[propName]).toBeA('function');
    });

    const date = new Date();
    const df = new Intl.DateTimeFormat('en', {year: 'numeric'});

    expect(intl.formatDate(date, {format: 'year-only'})).toBe(df.format(date));
  });

  it('inherits from an <IntlProvider> ancestor', () => {
    const props: WithIntlProps<Props> = {
      locale: 'en',
      timeZone: 'UTC',
      formats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
      messages: {
        hello: 'Hello, World!',
      },
      textComponent: 'span',

      defaultLocale: 'fr',
      defaultFormats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },

      onError: consoleError,
    };

    const intl = mount(
      <IntlProvider {...props}>
        <IntlProvider>
          <IntlChild />
        </IntlProvider>
      </IntlProvider>
    )
      .find(Child)
      .prop('intl');

    expect(consoleError).toHaveBeenCalledTimes(0);

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).toBe(props[propName]);
    });
  });

  it('shadows inherited intl config props from an <IntlProvider> ancestor', () => {
    const props = {
      locale: 'en',
      timeZone: 'Australia/Adelaide',
      formats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
      messages: {
        hello: 'Hello, World!',
      },

      defaultLocale: 'fr',
      defaultFormats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
    };

    const parentContext: IntlShape = mount(
      <IntlProvider {...props}>
        <IntlChild />
      </IntlProvider>
    )
      .find(Child)
      .prop('intl');

    const intl: IntlShape = mount(
      <IntlProvider
        locale="fr"
        timeZone="Atlantic/Azores"
        formats={{}}
        messages={{}}
        defaultLocale="en"
        defaultFormats={{}}
        textComponent="span"
      >
        <IntlChild />
      </IntlProvider>,
      {context: parentContext}
    )
      .find(Child)
      .prop('intl');

    expect(consoleError).toHaveBeenCalledTimes(0);

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).not.toBe(props[propName]);
    });
  });
});
