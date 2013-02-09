Flue
====

Flue is the mock API for Fireplace. It means that you don't need to run an
actual installation of the API or install any of its dependencies. It's super
fast and has options to do all sorts of cool stuff.

The API that's exposed to Fireplace from Zamboni should match the Flue's
implementation.


Installation
------------

You may wish to run Flue in a `virtualenv` ::

    curl -s https://raw.github.com/brainsik/virtualenv-burrito/master/virtualenv-burrito.sh | $SHELL
    source ~/.profile
    mkvirtualenv --no-site-packages fireplace


To use the `virtualenv`, simply run ::

    workon fireplace


Once your virtualenv is up and running, just install the requirements from the
`requirements.txt` file. ::

    pip install -r requirements.txt


Usage
-----

To start Flue, run ::

    workon fireplace
    python main.py


This will start a (local) instance on port 5000.
