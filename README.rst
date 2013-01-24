Fireplace
=========

Fireplace is a packaged version of the Firefox Marketplace's front-end.


Prerequirements
---------------

- ``lessc``: For stylesheets
- ``nunjucks``: For templates


If you intend to use Flue (the mocked-out API server), you will also need to
have Flask and perhaps a few other packages installed. That can be set up by
running ::

    pip install -r flue/requirements.txt


You may wish to run Flue in a virtualenv.


Usage
-----

From the terminal, run the following command ::

    python damper.py localhost 8081


This will start a local server on port 8081. There are no dependencies, so you
don't need to run this in a separate virtualenv.

In addition to an HTTP server, the damper will also run a less watcher (to
recompile CSS as it's edited) and a template watcher (to recompile templates
as they're edited).


Bugs
----

- If watched files are edited while the damper is not running, they will not
  be recompiled when the damper is started.
- If new templates or less files are added, they will not be recognized until
  the damper is restarted.


Missing Features
----------------

- numberfmt doesn't work (should probably be integrated with L10n
  pluralization)
- WebActivity support has not yet been added.
- emaillink doesn't generate safe links.
- Review replies
