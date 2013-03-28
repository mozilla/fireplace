# Fireplace

Fireplace is a packaged version of the Firefox Marketplace's front-end.

## Glossary

<dl>
  <dt>Damper</dt>
  <dd>A node.js server that serves a browser-friendly version of Fireplace</dd>

  <dt>Flue</dt>
  <dd>A mocked-out version of the Marketplace API.</dd>

  <dt>Hearth</dt>
  <dd>The source code for Fireplace.</dd>

  <dt>Inferno</dt>
  <dd>A build server which generates a packaged version of the Marketplace.</dd>
</dl>

## Installation

```bash
npm install -d
```

Our dependencies:

- `nunjucks`: For templates
- `stylus`: For stylesheets

If you plan on doing compilation (i.e.: you're Wil Clouser), you'll also need

- `clean-css`: For minifying CSS or whatever
- `requirejs`: For warming up Spaceheater
- `uglify-js`: For minifying JS and L10n string extraction

### Flue

If you intend to use Flue (the mocked-out API server), you will also need to
have Flask and perhaps a few other packages installed. That can be set up by
running:

```bash
pip install -r flue/requirements.txt
```

You may wish to run Flue in a `virtualenv`:

```bash
curl -s https://raw.github.com/brainsik/virtualenv-burrito/master/virtualenv-burrito.sh | $SHELL
source ~/.profile
mkvirtualenv --no-site-packages fireplace
```


### Getting node/npm

#### OS X

```bash
brew install node
```

And make sure that `/usr/local/share/npm/bin` is in your `$PATH`, à la: ::

```bash
export PATH=/usr/local/share/npm/bin:$PATH
```


## Usage

From the terminal, run the following command

```bash
node damper.js
```

This will start a local server on 0.0.0.0:8675 by default.

To control the hostname and port you can use the following otions

```bash
node damper.js --host 127.0.0.1 --port 8888
```

In addition to an HTTP server, the damper will also run a Stylus watcher (to
recompile CSS as it's edited) and a template watcher (to recompile templates
as they're edited).

For instructions on running Flue (the mock API server), please see the [Flue
docs](https://github.com/mozilla/fireplace/blob/master/flue/README.rst).


### Compiling

To run the compilation process, which compiles templates, CSS, and locale
files, run the damper with the `--compile` argument:

```bash
node damper.js --compile
```

The damper will not start a local server in this case, but a `strings.po` file
will be generated.


## Localizing

A detailed guide to extracting strings and creating JS language packs can be
found [on the wiki](https://github.com/mozilla/fireplace/wiki/L10n#extracting-strings).


## The API

[Read the docs.](http://zamboni.readthedocs.org/en/latest/topics/api.html)


## Bugs

- If new templates or ``.styl`` files are added, they will not be recognized
  until the damper is restarted. Deleted files may also cause problems.


## Missing Features

- `numberfmt` doesn't work (should probably be integrated with L10n
  pluralization)
- `WebActivity` support has not yet been added.
