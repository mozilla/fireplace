Fireplace
=========

Fireplace is a packaged version of the Firefox Marketplace's front-end.


Installation
------------

Our dependencies:

- ``less``: For stylesheets
- ``nunjucks``: For templates (stored as submodule)

If you plan on doing compilation (i.e.: you're Wil Clouser), you'll also need

- ``uglify-js``: For string extraction
- ``requirejs``: For warming up Spaceheater


OS X installation steps ::

    brew install node
    npm install less -g
    git submodule update --init  # For nunjucks

And make sure that `/usr/local/share/npm/bin` is in your `$PATH`, à la: ::

    export PATH=/usr/local/share/npm/bin:$PATH


If you intend to use Flue (the mocked-out API server), you will also need to
have Flask and perhaps a few other packages installed. That can be set up by
running ::

    pip install -r flue/requirements.txt

You may wish to run Flue in a `virtualenv` ::

    curl -s https://raw.github.com/brainsik/virtualenv-burrito/master/virtualenv-burrito.sh | $SHELL
    source ~/.profile
    mkvirtualenv --no-site-packages fireplace


Usage
-----

From the terminal, run the following command ::

    node damper.js

This will start a local server on 0.0.0.0:8675 by default.

To control the hostname and port you can use the following otions ::

    node damper.js --host 127.0.0.1 --port 8888

In addition to an HTTP server, the damper will also run a LESS watcher (to
recompile CSS as it's edited) and a template watcher (to recompile templates
as they're edited).

For instructions on running Flue (the mock API server), please see the Flue
docs. <https://github.com/mozilla/fireplace/blob/master/flue/README.rst>


Compiling
~~~~~~~~~

To run the compilation process, which compiles templates, CSS, and locale
files, run the damper with the `--compile` argument: ::

    node damper.js --compile

The damper will not start a local server in this case, but a `strings.po` file
will be generated.


Localizing
----------

The compilation process (described above) generates a file called `strings.po`
which can be uploaded to Verbatim. When the resulting language packs are
translated and returned, they can be reintroduced to Fireplace using the
`scripts/generate_langpacks.js` script. Running this script on a translated
`.po` file will produce a language pack which can be included in the repo. ::

    %> node scripts/generate_langpacks.js ~/Downloads/verbatim/esperanto.po
    %> ls ~/Downloads/verbatim
    .
    ..
    esperanto.po
    esperanto.po.js
    %> mv ~/Downloads/verbatim/esperanto.po hearth/locales/eo.js


Place all of the `.js` files in the `hearth/locales/` directory, renamed to
have its name in the format of its ISO 639-1 code plus ".js". Make sure you
commit that..stuff!


The API
-------

Read the docs. <http://zamboni.readthedocs.org/en/latest/topics/api.html>


Bugs
----

- If new templates or less files are added, they will not be recognized until
  the damper is restarted. Deleted files may also cause problems.


Missing Features
----------------

- numberfmt doesn't work (should probably be integrated with L10n
  pluralization)
- WebActivity support has not yet been added.
