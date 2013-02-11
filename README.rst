Fireplace
=========

Fireplace is a packaged version of the Firefox Marketplace's front-end.


Installation
------------

Our dependencies:

- ``less``: For stylesheets
- ``nunjucks``: For templates (stored as submodule)


OS X installation steps ::

    brew install node
    curl http://npmjs.org/install.sh | sh
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

To run flue, simply ``cd flue`` and run ::

    python main.py

This will start a (local) mocked API server on port 5000.


The API
-------

Read the docs. <http://zamboni.readthedocs.org/en/latest/topics/api.html>


Running Flue
------------

To run flue ::

    python flue/main.py

This defaults to 0.0.0.0:5000

To control the hostname and port you can use the following otions ::

    python flue/main.py --host 127.0.0.1 --port 9999

Bugs
----

- If new templates or less files are added, they will not be recognized until
  the damper is restarted. Deleted files may also cause problems.


Missing Features
----------------

- numberfmt doesn't work (should probably be integrated with L10n
  pluralization)
- WebActivity support has not yet been added.
- Review replies
