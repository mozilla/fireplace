# Marketplace Frontend

[![Build Status](https://travis-ci.org/mozilla/fireplace.svg?branch=master)](https://travis-ci.org/mozilla/fireplace)

The [Firefox Marketplace](https://marketplace.firefox.com) frontend.

- [Marketplace frontend documentation](https://marketplace-frontend.readthedocs.org)
- [Marketplace documentation](https://marketplace.readthedocs.org)
- [Marketplace API documentation](https://firefox-marketplace-api.readthedocs.org)

![screenshot of Marketplace homepage](https://cloud.githubusercontent.com/assets/203725/5194189/cd55c5f8-74be-11e4-8272-ce2ab4bc5af7.jpg "screenshot of Marketplace homepage")


## Installation and Usage

```bash
npm install
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
[Marketplace documentation](http://marketplace.readthedocs.org/latest/topics/package.html).

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

We use CasperJS to write tests.

### Running Unit Tests

Load [http://localhost:8675/tests](http://localhost:8675/tests) in your browser.

### Running Functional and UI Tests

Before running the functional and UI tests, your ```settings_local.js``` should
contain the same API and media URL found in [settings_travis.js](https://github.com/mozilla/fireplace/blob/master/tests/settings_travis.js).

```bash
make test
```

### Running a Single Functional or UI Test

```bash
casperjs test tests/ui/<PATH_TO_TEST_FILE>
```


## Serving with Nginx

If you wish to serve the Marketplace frontend with nginx, which is often
useful for keeping all the Marketplace projects on the same domain, read about
[serving Fireplace with Nginx](https://github.com/mozilla/fireplace/wiki/Using-Fireplace-with-Zamboni).
