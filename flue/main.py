"""
Flue is a simple application which mocks out the APIs used by Fireplace.
Pointing your instance of Fireplace using settings.js will allow you to
quickly get up and running without needing your own installation of Zamboni
or without needing to use -dev (offline mode).
"""

import hashlib
import json
import os
import random
import time
from functools import wraps
from optparse import OptionParser


from flask import Flask, make_response, request
app = Flask("Flue")

import defaults
import persona


PER_PAGE = 10
LATENCY = 0


# Monkeypatching for CORS and JSON.
ar = app.route
@wraps(ar)
def corsify(*args, **kwargs):
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            resp = func(*args, **kwargs)
            if isinstance(resp, (dict, str, unicode)):
                resp = make_response(json.dumps(resp), 200)
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Methods'] = 'GET'
            resp.headers['Content-type'] = 'application/json'
            if LATENCY:
                time.sleep(LATENCY)
            return resp

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = corsify


@app.route('/user/login', methods=['POST'])
def login():
    assertion = request.form.get('assertion')
    audience = request.form.get('audience')
    is_native = int(request.form.get('is_native'))

    print 'Attempting verification:', audience, is_native

    email = persona.verify_assertion(assertion, audience, is_native)
    if not email:
        return make_response('{"error": "bad_assertion"}', 403)

    # At this point, we know that the user is a valid user.

    return {
        'error': None,
        'token': persona.get_token(email),
        'settings': {
            'display_name': email.split('@')[0],
            'email': email,
            'region': 'usa',
        }
    }


@app.route('/user/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        pass

    return {
        'display_name': 'Joe User',
        'email': request.args.get('email'),
        'region': 'usa',
    }


@app.route('/user/<slug>/abuse', methods=['POST'])
def user_abuse(slug):
    return {'error': False}


@app.route('/app/<slug>/abuse', methods=['POST'])
def app_abuse(slug):
    return {'error': False}


@app.route('/feedback', methods=['POST'])
def feedback():
    return {'error': False}


@app.route('/terms-of-use', methods=['GET'])
def terms():
    return {'terms': defaults.ptext()}


@app.route('/privacy-policy', methods=['GET'])
def privacy():
    return {'privacy': defaults.ptext()}


@app.route('/app/<slug>/reviews', methods=['POST'])
def reviews(slug):
    return {'error': False}


@app.route('/featured')
def featured():
    return [defaults.app('feat %d' % i, 'Featured App') for i in xrange(8)]


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


def _paginated(field, generator):
    result_count = 24

    page = int(request.args.get('page', 0))
    if page * PER_PAGE > result_count:
        items = []
        results_left = False
    else:
        results_left = (page + 1) * PER_PAGE < result_count
        items = [gen for i, gen in
                zip(xrange(min(10, result_count - page * PER_PAGE)),
                    generator())]
    return {
        field: items,
        'pagination': {
            'page': page,
            'has_more': results_left,
            'count': len(items),
        },
    }


@app.route('/search')
def search():
    def gen():
        i = 0
        while 1:
            yield defaults.app('sr %d' % i, 'Result')
            i += 1

    data = _paginated('apps', gen)
    result_count = 34
    data['creatured'] = [defaults.app('creat %d' % i, 'Creatued App') for
                         i in xrange(4)]
    data['meta'] = {
        'query': request.args.get('q'),
        'sort': request.args.get('sort'),
        'cat': request.args.get('cat'),
    }
    return data


@app.route('/app/<slug>/ratings')
def app_ratings(slug):
    def gen():
        i = 0
        while 1:
            yield defaults.rating()
            i += 1
    data = _paginated('ratings', gen)
    result_count = 34
    data.update(defaults.app_user_data(data))
    data['user']['can_rate'] = True
    data['user']['has_rated'] = False
    data['meta'] = {
        'slug': slug,
        'average': random.random() * 4 + 1,
        'count': 24,
    }
    return data


@app.route('/app/<slug>')
def app_(slug):
    return defaults.app(slug, 'Something something %s' % slug)


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '5000'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    parser.add_option('--latency', dest='latency',
            help='latency (sec)', metavar='LATENCY', default=0)
    (options, args) = parser.parse_args()
    app.debug = True
    LATENCY = int(options.latency)
    app.run(host=options.hostname, port=int(options.port))
