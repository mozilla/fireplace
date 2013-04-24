"""
Flue is a simple application which mocks out the APIs used by Fireplace.
Pointing your instance of Fireplace using settings.js will allow you to
quickly get up and running without needing your own installation of Zamboni
or without needing to use -dev (offline mode).
"""

import json
import os
import random
import time
import urllib
import urlparse
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
    methods = kwargs.get('methods') or ['GET']
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            resp = func(*args, **kwargs)
            if isinstance(resp, (dict, list, tuple, str, unicode)):
                resp = make_response(json.dumps(resp, indent=2), 200)
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Methods'] = ','.join(methods)
            resp.headers['Access-Control-Allow-Headers'] = 'X-HTTP-METHOD-OVERRIDE'
            resp.headers['Content-type'] = 'application/json'
            if LATENCY:
                time.sleep(LATENCY)
            return resp

        if 'methods' in kwargs:
            kwargs['methods'].append('OPTIONS')

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = corsify


@app.route('/api/v1/account/login/', methods=['POST'])
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


@app.route('/api/v1/account/settings/mine/', methods=['GET', 'PATCH'])
def settings():
    return {
        'display_name': 'Joe User',
        'email': request.args.get('email'),
        'region': 'usa',
    }


@app.route('/api/v1/account/installed/mine/')
def installed():
    return {
        'objects': [defaults.app('purchase %d' % i, 'Purchased App') for
                      i in xrange(random.randint(5, 30))]
    }


@app.route('/api/v1/abuse/user/', methods=['POST'])
def user_abuse(slug):
    return {'error': False}


@app.route('/api/v1/abuse/app/', methods=['POST'])
def app_abuse():
    if not request.form.get('text'):
        return {'error': True}
    return {'error': False}


@app.route('/api/v1/account/feedback/', methods=['POST'])
def feedback():
    if not request.form.get('feedback'):
        return {'error': True}
    return {'error': False}


@app.route('/terms-of-use.html', methods=['GET'])
def terms():
    return defaults.ptext()


@app.route('/privacy-policy.html', methods=['GET'])
def privacy():
    return defaults.ptext()


@app.route('/api/v1/home/featured/')
def featured():
    return {'objects':
        [defaults.app('feat %d' % i, 'Featured App') for i in xrange(8)]}


@app.route('/api/v1/apps/category/')
def categories():
    return [
        defaults.category('shopping', 'Shopping'),
        defaults.category('games', 'Games'),
        defaults.category('productivity', 'Productivity'),
        defaults.category('social', 'Social'),
        defaults.category('music', 'Music'),
        defaults.category('lifestyle', 'Thug Life'),
    ]


@app.route('/api/v1/home/page/')
def homepage():
    return {
        'featured': featured._orig()['objects'],
        'categories': categories._orig(),
    }


def _paginated(field, generator):
    result_count = 24

    page = int(request.args.get('offset', 0)) / PER_PAGE
    if page * PER_PAGE > result_count:
        items = []
    else:
        items = [gen for i, gen in
                 zip(xrange(min(10, result_count - page * PER_PAGE)),
                     generator())]

    next_page = None
    if (page + 1) * PER_PAGE <= result_count:
        next_page = request.url
        next_page = next_page[len(request.base_url) -
                              len(request.path + request.script_root):]
        if '?' in next_page:
            next_page_qs = urlparse.parse_qs(
                next_page[next_page.index('?') + 1:])
            next_page_qs = dict(zip(next_page_qs.keys(),
                                    [x[0] for x in next_page_qs.values()]))
            next_page = next_page[:next_page.index('?')]
        else:
            next_page_qs = {}
        next_page_qs['offset'] = (page + 1) * PER_PAGE
        next_page_qs['limit'] = PER_PAGE
        next_page = next_page + '?' + urllib.urlencode(next_page_qs)

    return {
        field: items,
        'meta': {
            'limit': PER_PAGE,
            'offset': PER_PAGE * page,
            'next': next_page,
            'total_count': len(items),
        },
    }


@app.route('/api/v1/apps/search/')
def search():
    def gen():
        i = 0
        while 1:
            yield defaults.app('sr %d' % i, 'Result')
            i += 1

    data = _paginated('objects', gen)
    return data


@app.route('/api/v1/apps/search/featured/')
def category():
    def gen():
        i = 0
        while 1:
            yield defaults.app('catm %d' % i, 'Category Item')
            i += 1

    data = _paginated('objects', gen)
    data['featured'] = [defaults.app('creat %d' % i, 'Creatured App') for
                        i in xrange(15)]
    return data


@app.route('/api/v1/apps/rating/', methods=['GET', 'POST'])
def app_ratings():
    if request.method == 'POST':
        return {'error': False}

    def gen():
        i = 0
        while 1:
            yield defaults.rating()
            i += 1

    slug = request.form.get('app') or request.args.get('app')

    data = _paginated('objects', gen)
    data['info'] = {
        'slug': slug,
        'average': random.random() * 4 + 1,
    }
    data.update(defaults.app_user_data(slug))
    return data


@app.route('/api/v1/apps/rating/<id>/', methods=['GET', 'PUT', 'DELETE'])
def app_rating(id):
    if request.method in ('PUT', 'DELETE'):
        return {'error': False}

    return defaults.rating()


@app.route('/api/v1/apps/rating/<id>/flag/', methods=['POST'])
def app_rating_flag(id):
    return ''


@app.route('/api/v1/apps/app/<slug>/')
def app_(slug):
    return defaults.app(slug, 'Something something %s' % slug)


@app.route('/api/v1/receipts/install/', methods=['POST'])
def record():
    return {'error': False}


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '5000'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    parser.add_option('--latency', dest='latency',
            help='latency (sec)', metavar='LATENCY', default=0)
    parser.add_option('--xss', dest='xss',
            help='xss?', metavar='XSS', default=0)
    (options, args) = parser.parse_args()
    app.debug = True
    LATENCY = int(options.latency)
    if options.xss:
        defaults.XSS = bool(options.xss)
    app.run(host=options.hostname, port=int(options.port))
