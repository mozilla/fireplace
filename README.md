# Fireplace

The [Firefox Marketplace](https://marketplace.firefox.com) frontend.

[![Build Status](https://travis-ci.org/mozilla/fireplace.svg?branch=master)](https://travis-ci.org/mozilla/fireplace)


## Installation

```bash
make init
make serve
```

This will start a webserver on http://localhost:8675.


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

## Glossary

<dl>
  <dt><a href="https://github.com/mozilla/flue">Flue</a></dt>
  <dd>A mocked-out version of the Marketplace API.</dd>

  <dt>Yule Log</dt>
  <dd>A fake version of Fireplace to provide the Gaia team with a package that can
  be shipped and later upgraded to the real Fireplace.</dd>

  <dt><a href="https://github.com/mozilla/ashes">Ashes</a></dt>
  <dd>A secure debug information collection server</dd>
</dl>

### Flue

Flue documentation can be found in
[Flue's README](https://github.com/mozilla/flue/blob/master/README.md).

### Yule Log

Docs can be found in
[Yule Log's README](https://github.com/mozilla/fireplace/blob/master/yulelog/README.md) and
in the
[Marketplace documentation](http://marketplace.readthedocs.org/en/latest/topics/package.html).

### Packaged App

Docs can be found in the [Marketplace Documentation](http://marketplace.readthedocs.org/en/latest/topics/package.html).

Please note that any file that belongs in the package must get added to `package/files.txt`.


## Localizing

A detailed guide to extracting strings and creating JS language packs can be
found [on the wiki](https://github.com/mozilla/commonplace/wiki/L10n#extracting-strings).


## API

[Read the docs.](http://firefox-marketplace-api.readthedocs.org/)


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

## Developing the Packaged App

To package the Marketplace frontend, run:

```make package```

This will output a package and output to ```package/archives/```. You can use
WebIDE to install this package in the device or simulator.


## Serving with Nginx

Read about [serving Fireplace with Nginx](https://github.com/mozilla/fireplace/wiki/Using-Fireplace-with-Zamboni)
