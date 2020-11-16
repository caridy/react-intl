# Contributing

Pull requests are very welcome, but should be within the scope of the project, and follow the repository's code conventions. Before submitting a pull request, it's always good to file an issue, so we can discuss the details of the PR.

## Reporting a Bug

1. Ensure you've replicated the issue against `main`. There is a chance the issue may have already been fixed.

2. Search for any similar issues (both opened and closed). There is a chance someone may have reported it already.

3. Provide a demo of the bug isolated in a codesandbox.io. Sometimes this is not a possibility, in which case provide a detailed description along with any code snippets that would help in triaging the issue. If we cannot reproduce it, we will close it.

4. The best way to demonstrate a bug is to build a failing test. This is not required, however, it will generally speed up the development process.

## Submitting a pull request

1. [Fork](https://github.com/formatjs/formatjs/fork/) the repository.

1. Ensure that all tests are passing prior to submitting.

1. If you are adding new functionality, or fixing a bug, provide test coverage.

1. Follow syntax guidelines detailed below.

1. Push the changes to your fork and submit a pull request. If this resolves any issues, please mark in the body `fix #ID` within the body of your pull request. This allows for github to automatically close the related issue once the pull request is merged.

1. Last step, [submit the pull request](https://github.com/formatjs/formatjs/compare/)!

## Development

We currently use [`bazel`](https://bazel.build/) to develop, along with [lerna](https://lerna.js.org/) for package management.

Required UNIX dependencies:

- `zic` for `intl-datetimeformat` tz compilation
- `zdump` for `intl-datetimeformat` tz dump
- `realpath` for absolute path resolution

To setup locally, first initialize the git submodule:

```sh
> git submodule init
> git submodule update
```

Now you can build & test with yarn:

```sh
> yarn
> yarn build
> yarn test
```

To run examples:

```sh
> yarn examples
```

Releases can be done with the following steps:

```sh
> yarn release
```

To publish next tag

```sh
> yarn release:next
```
