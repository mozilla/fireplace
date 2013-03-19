# Fireplace

Fireplace is a packaged version of the Firefox Marketplace's front-end.

## Installation

```bash
npm install -d
git submodule update --init  # For nunjucks
```

Our dependencies:

- `nunjucks`: For templates (stored as submodule)
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

The compilation process (described above) generates a file called `strings.po`
which can be uploaded to [Verbatim](http://localize.mozilla.org/). When the
resulting language packs are translated and returned, they can be reintroduced
to Fireplace using the `scripts/generate_langpacks.js` script. Running this
script on a translated `.po` file will produce a language pack which can be
included in the repo. ::

    %> node scripts/generate_langpacks.js ~/Downloads/verbatim/esperanto.po
    %> ls ~/Downloads/verbatim
    .
    ..
    esperanto.po
    esperanto.po.js
    %> mv ~/Downloads/verbatim/esperanto.po hearth/locales/eo-EO.js


Place all of the `.js` files in the `hearth/locales/` directory, renamed to
have its name in the format of `xx-YY` plus `.js`. Make sure you commit
that...stuff!


### Testing Locales

You can add a query parameter to the URL to force a language override:

```
http://localhost:8675/?lang=pt-BR
```


## The API

[Read the docs.](http://zamboni.readthedocs.org/en/latest/topics/api.html)


## Bugs

- If new templates or ``.styl`` files are added, they will not be recognized
  until the damper is restarted. Deleted files may also cause problems.


## Missing Features

- `numberfmt` doesn't work (should probably be integrated with L10n
  pluralization)
- `WebActivity` support has not yet been added.
