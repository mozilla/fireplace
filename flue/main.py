"""
Flue is a simple application which mocks out the APIs used by Fireplace.
Pointing your instance of Fireplace using settings.js will allow you to
quickly get up and running without needing your own installation of Zamboni
or without needing to use -dev (offline mode).
"""

import json
import random
from functools import wraps

from flask import Flask, make_response, render_template, request, url_for
app = Flask("Flue")

import defaults


# Monkeypatching for CORS and JSON.
ar = app.route
@wraps(ar)
def corsify(*args, **kwargs):
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            resp = make_response(json.dumps(func(*args, **kwargs)), 200)
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Methods'] = 'GET'
            resp.headers['Content-type'] = 'application/json'
            return resp

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = corsify


@app.route('/featured')
def featured():
    return [defaults.app('feat %d' % i, 'Featured App') for i in xrange(6)]


@app.route('/categories')
def categories():
    return [
        defaults.category('shopping', 'Shopping'),
        defaults.category('games', 'Games'),
        defaults.category('productivity', 'Productivity'),
        defaults.category('social', 'Social'),
        defaults.category('music', 'Music'),
        defaults.category('lifestyle', 'Thug Life'),
    ]


@app.route('/homepage')
def homepage():
    return {
        'featured': featured._orig(),
        'categories': categories._orig(),
    }


@app.route('/app/<slug>/ratings')
def app_ratings(slug):
    return {
        'slug': slug,
        'meta': {
            'average': random.random() * 4 + 1,
            'count': int(random.random() * 500),
        },
        'ratings': [defaults.rating() for i in range(random.randint(0, 10))],
        'user': {
            'can_rate': True,
            'has_review': False
        }
    }


@app.route('/app/<slug>')
def app_(slug):
    return defaults.app(slug, 'Something something %s' % slug)


if __name__ == "__main__":
    app.debug = True
    app.run()
