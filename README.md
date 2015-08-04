# Marketplace Frontend

[![Build Status](https://travis-ci.org/mozilla/fireplace.svg?branch=master)](https://travis-ci.org/mozilla/fireplace)

The [Firefox Marketplace](https://marketplace.firefox.com) frontend.

- [Marketplace frontend documentation](https://marketplace-frontend.readthedocs.org)
- [Marketplace documentation](https://marketplace.readthedocs.org)
- [Marketplace API documentation](https://firefox-marketplace-api.readthedocs.org)

![screenshot of Marketplace homepage](https://cloud.githubusercontent.com/assets/674727/9073521/e84f9a0a-3ab6-11e5-98e5-f10f23ac2850.png)


## Installation and Usage

```bash
make install
make serve
```

This will start a web server on ```http://localhost:8675```.

### Building for Production

Our build process bundles up our JS, minifies our CSS, compiles our templates,
and extracts locales into JS modules. To run the build process:

```bash
make build
```

This will generate files including:

```
src/media/templates.js
src/media/js/include.js
src/media/js/include.js.map
src/media/css/include.css
```

### Developing the Packaged App

To package the Marketplace frontend, run:

```make package```

This will output a package and output to ```package/archives/```. You can use
WebIDE to install this package in the device or simulator.

Further details can be found in the
[Marketplace documentation](http://marketplace.readthedocs.org/en/latest/topics/packaged-apps.html).

### Marketplace Mock API

We have an instance of a mocked version of the Marketplace API at
```https://flue.paas.allizom.org```. Documentation can be found in
[marketplace-api-mock's repository](https://github.com/mozilla/marketplace-api-mock/blob/master/README.md).

### iframed Package

We currently ship with an iframed version of the Marketplace frontend. It is
a package that contains an iframe pointing to the Marketplace website.
See more details within [the iframe package directory](https://github.com/mozilla/fireplace/blob/master/package/iframe).


## Localizing

A detailed guide to extracting strings and creating JS language packs is
located
[on the wiki](https://github.com/mozilla/commonplace/wiki/L10n#extracting-strings).


## Tests

We use CasperJS to write UI tests and mocha, chai and sinon for unit tests.

### Running Unit Tests

```bash
make unittest
```

This will launch the [karma test runner](https://karma-runner.github.io/) that
will run the unit tests in a new instance of Firefox.

### Running Functional and UI Tests

Before running the functional and UI tests, your `settings_local.js` should have
`api_url` and `media_url` pointing to an instance of
[marketplace-api-mock](https://github.com/mozilla/marketplace-api-mock). You can
easily achieve this by setting the `API` environment variable when calling
`make serve`, this will overwrite your current `api_url` and `media_url` settings.

First, start a server with:

```bash
API=mock make serve
```

Then, run the tests against it. We support both PhantomJS and SlimerJS to run tests in
WebKit and Gecko, respectively. To run both use `make uitest`, if you just want to run
them in one browser `make uitest-phantom` or `make uitest-slimer`.

```bash
make uitest-phantom
```

### Running Functional and UI Tests in SlimerJS

SlimerJS requires a path to a `firefox` binary. `make uitest-slimer` will try to use
`/Applications/Firefox.app/Contents/MacOS/firefox` which is the path to your default
Firefox on Mac. This path might not work for you and best results are achieved by using
Firefox 30. You can download a copy of Firefox 30 on
[ftp.mozilla.org](http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/30.0/). To
set the path to your `firefox` use the `SLIMERJSLAUNCHER` environment variable. You
might want to call `export SLIMERJSLAUNCHER=/path/to/firefox` in your shell's setup
script.

```bash
SLIMERJSLAUNCHER=/Applications/Firefox-30.app/Contents/MacOS/firefox make uitest-slimer
```

### Running a Single Functional or UI Test

```bash
UITEST_FILE=tests/ui/<PATH_TO_TEST_FILE> make uitest
```


## Serving with Nginx

If you wish to serve the Marketplace frontend with nginx, which is often
useful for keeping all the Marketplace projects on the same domain, read about
[serving Fireplace with Nginx](https://github.com/mozilla/fireplace/wiki/Using-Fireplace-with-Zamboni).
