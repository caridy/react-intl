import enforceDefaultMessage from '../rules/enforce-default-message';
import {noMatch, spreadJsx, emptyFnCall, dynamicMessage} from './fixtures';
import {ruleTester} from './util';

ruleTester.run('enforce-default-message', enforceDefaultMessage, {
  valid: [
    `import {defineMessage} from 'react-intl'
defineMessage({
    defaultMessage: 'this is default message',
    description: 'asd'
})`,
    `intl.formatMessage({
    defaultMessage: 'this is default message',
    description: 'asd'
})`,
    `intl.formatMessage({
  defaultMessage: 'this is default message' + 'vvv',
  description: 'asd'
})`,
    `import {FormattedMessage} from 'react-intl'
const a = <FormattedMessage defaultMessage={'asf' + 'bar'}/>`,
    dynamicMessage,
    noMatch,
    spreadJsx,
    emptyFnCall,
  ],
  invalid: [
    {
      code: `
            import {defineMessage} from 'react-intl'
            defineMessage({
                description: 'this is default message'
            })`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {defineMessage} from 'react-intl'
            defineMessage({
                description: 'this is default message'
            })`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {defineMessage} from 'react-intl'
            defineMessage({
                defaultMessage,
                description: 'this is default message'
            })`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            intl.formatMessage({
                defaultMessage,
                description: 'this is default message'
            })`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            import {defineMessage} from 'react-intl'
            defineMessage({
                defaultMessage: foo
            })`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            intl.formatMessage({
                description: 'this is description'
            })`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {defineMessages} from 'react-intl'
            defineMessages({
              foo: {
                description: 'this is description'
              }
            })`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage description="this is description"/>`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage description="this is description"></FormattedMessage>`,
      errors: [
        {
          message: '`defaultMessage` has to be specified in message descriptor',
        },
      ],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage defaultMessage={defaultMessage} description="this is description"/>`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage defaultMessage={defaultMessage}/>`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage defaultMessage={\`asf\`} description="this is description"></FormattedMessage>`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
    {
      code: `
            import {FormattedMessage} from 'react-intl'
            const a = <FormattedMessage defaultMessage={\`asf\`}/>`,
      errors: [
        {
          message:
            '`defaultMessage` must be a string literal (not function call or variable)',
        },
      ],
      options: ['literal'],
    },
  ],
});
