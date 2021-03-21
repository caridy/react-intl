load("@bazelbuild_buildtools//buildifier:def.bzl", "buildifier")
load("@com_github_ash2k_bazel_tools//multirun:def.bzl", "multirun")
load("@npm//karma:index.bzl", "karma_test")
load("//tools:index.bzl", "BUILDIFIER_WARNINGS")

# Allow any ts_library rules in this workspace to reference the config
# Note: if you move the tsconfig.json file to a subdirectory, you can add an alias() here instead
#   so that ts_library rules still use it by default.
#   See https://www.npmjs.com/package/@bazel/typescript#installation
exports_files(
    [
        "tsconfig.json",
        "tsconfig.esm.json",
        "tsconfig.es6.json",
        "karma.conf.js",
        "karma.conf-ci.js",
        "jest.config.js",
        ".prettierrc.json",
    ],
    visibility = ["//:__subpackages__"],
)

# We run this centrally so it doesn't spawn
# multiple browser sessions which overwhelms SauceLabs
KARMA_TESTS = [
    "//packages/intl-displaynames:bundled-karma-tests",
    "//packages/intl-getcanonicallocales:bundled-karma-tests",
    "//packages/intl-listformat:bundled-karma-tests",
    "//packages/intl-pluralrules:bundled-karma-tests",
    "//packages/intl-relativetimeformat:bundled-karma-tests",
]

karma_test(
    name = "karma",
    configuration_env_vars = [
        "SAUCE_USERNAME",
        "SAUCE_ACCESS_KEY",
    ],
    data = [
        "//:karma.conf.js",
        "@npm//karma-jasmine",
        "@npm//karma-chrome-launcher",
        "@npm//karma-sauce-launcher",
        "@npm//karma-jasmine-matchers",
    ] + KARMA_TESTS,
    tags = ["manual"],
    templated_args = [
        "start",
        "$(rootpath //:karma.conf.js)",
        "--browsers",
        "ChromeHeadless",
    ],
)

karma_test(
    name = "karma-ci",
    size = "large",
    configuration_env_vars = [
        "SAUCE_USERNAME",
        "SAUCE_ACCESS_KEY",
        "GITHUB_RUN_ID",
    ],
    data = [
        "//:karma.conf.js",
        "@npm//karma-jasmine",
        "@npm//karma-chrome-launcher",
        "@npm//karma-sauce-launcher",
        "@npm//karma-jasmine-matchers",
    ] + KARMA_TESTS,
    tags = ["manual"],
    templated_args = [
        "start",
        "$(rootpath //:karma.conf.js)",
        "--browsers",
        "sl_edge,sl_chrome,sl_firefox,sl_ie_11,sl_safari",
    ],
)

multirun(
    name = "prettier_all",
    commands = [
        "//packages/babel-plugin-formatjs:prettier",
        "//packages/cli:prettier",
        "//packages/ecma402-abstract:prettier",
        "//packages/eslint-plugin-formatjs:prettier",
        "//packages/faster-messageformat-parser:prettier",
        "//packages/intl-datetimeformat:prettier",
        "//packages/intl-displaynames:prettier",
        "//packages/intl-durationformat:prettier",
        "//packages/intl-getcanonicallocales:prettier",
        "//packages/intl-listformat:prettier",
        "//packages/intl-locale:prettier",
        "//packages/intl-localematcher:prettier",
        "//packages/intl-messageformat-parser:prettier",
        "//packages/intl-messageformat:prettier",
        "//packages/intl-numberformat:prettier",
        "//packages/intl-pluralrules:prettier",
        "//packages/intl-relativetimeformat:prettier",
        "//packages/intl:prettier",
        "//packages/react-intl:prettier",
        "//packages/react-intl/examples:prettier",
        "//packages/ts-transformer:prettier",
        "//packages/vue-intl:prettier",
        "//tools:prettier",
        "//website:prettier",
    ],
)

multirun(
    name = "tests-locale-data-all.update",
    testonly = True,
    commands = [
        "//packages/intl-datetimeformat:test262-main.update",
        "//packages/intl-datetimeformat:tests-locale-data-all.update",
        "//packages/intl-displaynames:test262-main.update",
        "//packages/intl-displaynames:tests-locale-data-all.update",
        "//packages/intl-listformat:test262-main.update",
        "//packages/intl-listformat:tests-locale-data-all.update",
        "//packages/intl-numberformat:test262-main.update",
        "//packages/intl-numberformat:tests-locale-data-all.update",
        "//packages/intl-pluralrules:test262-main.update",
        "//packages/intl-pluralrules:tests-locale-data-all.update",
        "//packages/intl-relativetimeformat:test262-main.update",
        "//packages/intl-relativetimeformat:tests-locale-data-all.update",
    ],
)

buildifier(
    name = "buildifier",
    exclude_patterns = ["./node_modules/*"],
    lint_mode = "fix",
    lint_warnings = BUILDIFIER_WARNINGS,
    verbose = True,
)
