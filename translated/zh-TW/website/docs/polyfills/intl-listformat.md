---
id: intl-listformat
title: Intl.ListFormat
---

A spec-compliant polyfill for Intl.ListFormat fully tested by the [official ECMAScript Conformance test suite](https://github.com/tc39/test262)

[![npm Version](https://img.shields.io/npm/v/@formatjs/intl-listformat.svg?style=flat-square)](https://www.npmjs.org/package/@formatjs/intl-listformat) ![size](https://badgen.net/bundlephobia/minzip/@formatjs/intl-listformat)

## Installation

```
npm install @formatjs/intl-listformat
```

## Requirements

If you're supporting IE11-, this requires [`Intl.getCanonicalLocales`](intl-getcanonicallocales.md).

## Usage

To use the polyfill, just import it to make sure that a fully functional Intl.ListFormat is available in your environment:

```tsx
import '@formatjs/intl-listformat/polyfill';
```

If Intl.ListFormat already exists, the polyfill will not be loaded.

To load locale data, you can include them on demand:

```js
import '@formatjs/intl-listformat/polyfill';
import '@formatjs/intl-listformat/locale-data/en'; // Add locale data for en
import '@formatjs/intl-listformat/locale-data/de'; // Add locale data for de
```

If you want to polyfill all locales (e.g for Node):

```tsx
import '@formatjs/intl-listformat/polyfill-locales';
```

## Tests

This library is fully [test262](https://github.com/tc39/test262/tree/master/test/intl402/ListFormat)-compliant.
