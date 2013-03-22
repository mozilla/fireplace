Flue
====

Flue is the mock API for Fireplace. It means that you don't need to run an
actual installation of the API or install any of its dependencies. It's super
fast and has options to do all sorts of cool stuff.

The API that's exposed to Fireplace from Zamboni should match the Flue's
implementation.


Foreword
--------

You probably don't need to install Flue! A version of flue that matches the
implementation that exists on the Marketplace API runs at: ::

    http://flue.paas.allizom.org/

This is already set up in your `settings_local.js` file if you installed your
copy of Fireplace with `npm install`. Cool!

Some reasons that you might need to use a local copy of Flue:

* You're working on the API
* You have a spotty internet connection
* You're creating new features which use yet-to-be-built APIs
* You have trust issues and don't want us to see your Persona


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


This defaults to `0.0.0.0:5000`

To control the hostname and port you can use the following otions ::

    python flue/main.py --host 127.0.0.1 --port 9999
