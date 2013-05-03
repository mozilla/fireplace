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
app = Flask("Flue", static_path='/media', static_folder='media')

ar = app.route
@wraps(ar)
def magicify(*args, **kwargs):
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            resp = func(*args, **kwargs)
            if isinstance(resp, (dict, list, tuple)):
                resp = make_response(json.dumps(resp, indent=2), 200)
                resp.headers['Content-type'] = 'application/json'
            return resp

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = magicify


import defaults
import persona


apps = {}
apps['marketplace'] = {
    'name': 'Firefox Marketplace',
    'summary': 'The Firefox Marketplace, powered by Zamboni',
    'manifest_url': 'https://marketplace.firefox.com/manifest.webapp',
    'icons': {
        64: '/media/img/marketplace.png',
        128: '/media/img/marketplace.png',
    },
    'ratings': {'average': 3, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace.firefox.com/',
    'previews': [
        {
            'caption': 'The Marketplace',
            'filetype': 'image/jpg',
            'thumbnail_url': 'http://i.imgur.com/oXYEAyC.jpg',
            'image_url': 'http://i.imgur.com/6q3w3O8h.jpg',
        },
    ],
}
apps['fireplace'] = {
    'name': 'Fireplace',
    'summary': 'The Firefox Marketplace, powered by the magic of JavaScript',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/64.png',
        128: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/128.png',
    },
    'ratings': {'average': 5, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
    'previews': [
        {
            'caption': 'The Marketplace',
            'filetype': 'image/jpg',
            'thumbnail_url': 'http://i.imgur.com/Fs2e1ze.jpg',
            'image_url': 'http://i.imgur.com/yE7hfgSh.jpg',
        },
    ],
}
apps['afterhours'] = {
    'name': 'Firefox After Hours',
    'summary': 'Get your fox on',
    'manifest_url': 'http://people.mozilla.org/~cwiemeersch/afterhours.webapp',
    'icons': {
        64: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/64.png',
        128: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/128.png',
    },
    'ratings': {'average': 5, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['foxfire'] = {
    'name': 'FoxFire Place of Marketing',
    'summary': 'The best place.',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/64.png',
        128: 'https://marketplace.cdn.mozilla.net/media/fireplace/img/logos/128.png',
    },
    'ratings': {'average': 2, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['gambling'] = {
    'name': 'Firepoker Gambleplace',
    'summary': 'Spend your bitcoins with us',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: 'http://www.veryicon.com/icon/png/Game/Poker/Poker.png',
        128: 'http://www.veryicon.com/icon/png/Game/Poker/Poker.png',
    },
    'ratings': {'average': 4, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['placemat'] = {
    'name': 'Marketplacemat',
    'summary': 'We sell table coverings',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: '/media/img/placemat.png',
        128: '/media/img/placemat.png',
    },
    'ratings': {'average': 3, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
    'previews': [
        {
            'caption': 'The Marketplace',
            'filetype': 'image/jpg',
            'thumbnail_url': 'http://www.battenburglace.com/LX_Placemat_20871.jpg',
            'image_url': 'http://www.battenburglace.com/LX_Placemat_20871.jpg',
        },
    ],
}
apps['retroplace'] = {
    'name': 'Retroplace',
    'summary': 'Old, stale apps',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: '/media/img/bitplace.png',
        128: '/media/img/bitplace.png',
    },
    'ratings': {'average': 3, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
    'previews': [
        {
            'caption': 'The Marketplace',
            'filetype': 'image/jpg',
            'thumbnail_url': 'http://i.imgur.com/kXkqCLw.jpg',
            'image_url': 'http://i.imgur.com/JRf1Ifhh.jpg',
        },
    ],
}
apps['nightly'] = {
    'name': 'Marketplace Nightly',
    'summary': 'Cutting edge Marketplace shenanigans',
    'manifest_url': 'http://inferno.paas.allizom.org/minifest',
    'is_packaged': True,
    'icons': {
        64: '/media/img/nightly.png',
        128: '/media/img/nightly.png',
    },
    'ratings': {'average': 3, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['bastaplace'] = {
    'name': 'BastaCorp Apps and AI',
    'summary': 'We make your apps come to life',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: '/media/img/bastacorp.png',
        128: '/media/img/bastacorp.png',
    },
    'ratings': {'average': 5, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['idw'] = {
    'name': 'Informed Discussion App Store',
    'summary': 'Apps that are informed about having discussions',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: '/media/img/idw.png',
        128: '/media/img/idw.png',
    },
    'ratings': {'average': 5, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}
apps['kumarketplace'] = {
    'name': 'Kumarketplace',
    'summary': 'Apps made by Kumar',
    'manifest_url': 'https://marketplace-altdev.allizom.org/manifest.webapp',
    'icons': {
        64: '/media/img/marketplace.png',
        128: '/media/img/marketplace.png',
    },
    'ratings': {'average': 5, 'count': int(random.random() * 500)},
    'homepage': 'https://marketplace-altdev.allizom.org/',
}

for slug, app_ in apps.iteritems():
    app_['slug'] = slug
    app_['support_email'] = 'noreply@mozilla.com'
    app_['privacy_policy'] = ''
    app_['current_version'] = 1
    app_['public_stats'] = False
    app_['upsell'] = False
    if 'price' not in app_:
        app_['price'] = None
    if 'is_packaged' not in app_:
        app_['is_packaged'] = False
    if 'listed_authors' not in app_:
        app_['listed_authors'] = [random.choice([
            {'name': 'basta'},
            {'name': 'cvan'},
            {'name': 'Chris Van Halen'},
        ])]
    if 'previews' not in app_:
        app_['previews'] = [defaults._app_preview() for i in range(4)]
    app_['notices'] = []
    app_['description'] = app_['summary']

categories = {
    'marketplaces': ['marketplace', 'fireplace'],
    'app-stores': ['foxfire', 'afterhours', 'placemat'],
    'mozilla': ['marketplace', 'fireplace'],
    'basta': ['bastaplace', 'idw'],
    'adult': ['afterhours'],
    'gambling': ['gambling', 'placemat'],
}

for cat_ in categories:
    apps_ = []
    for slug in categories[cat_]:
        apps_.append(apps[slug])
    categories[cat_] = apps_


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
        'objects': random.sample(apps.values(), 4)
    }


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


@app.route('/api/v1/apps/category/')
def categories_():
    return {
        'objects': [
            defaults.category('marketplaces', 'Marketplaces'),
            defaults.category('app-stores', 'App Stores'),
            defaults.category('mozilla', 'Mozilla'),
            defaults.category('basta', 'BastaCorp'),
            defaults.category('adult', 'Adult Themed'),
            defaults.category('gambling', 'Gambling'),
        ]
    }


def _paginated(generator):
    offset = int(request.args.get('offset', 0))
    PER_PAGE = 10
    objects = generator[offset:offset + PER_PAGE]

    next_page = None
    if offset + PER_PAGE < len(generator):
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
        next_page_qs['offset'] = offset + PER_PAGE
        next_page_qs['limit'] = PER_PAGE
        next_page = next_page + '?' + urllib.urlencode(next_page_qs)

    return {
        'objects': objects,
        'meta': {
            'limit': PER_PAGE,
            'offset': offset,
            'next': next_page,
            'total_count': len(objects),
        },
    }


def search():
    q = request.args.get('q')
    if not q:
        return _paginated(apps.values())

    def gen(app_):
        for k in app_.keys():
            if (isinstance(app_[k], (str, unicode)) and
                q.lower() in app_[k].lower()):
                print 'Found %s in %s' % (q, app_[k])
                return True

    return _paginated([a for a in apps.values() if gen(a)])

app.route('/api/v1/apps/search/')(search)


@app.route('/api/v1/apps/search/featured/')
def category():
    cat = request.form.get('cat')
    if not cat:
        data = search()
        data['featured'] = [apps['marketplace'], apps['fireplace'],
                            apps['afterhours']]
    else:
        data = _paginated(categories[cat])
        data['featured'] = []
    return data


@app.route('/api/v1/apps/rating/', methods=['GET', 'POST'])
def app_ratings():
    if request.method == 'POST':
        return {'error': False}

    slug = request.form.get('app') or request.args.get('app')

    data = _paginated([defaults.rating() for r in xrange(random.randint(1, 250))])
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


@app.route('/api/v1/apps/app/<slug>/')
def app_(slug):
    return apps[slug]


@app.route('/api/v1/receipts/install/', methods=['POST'])
def record():
    return {'error': False}


@app.route('/')
@app.route('/<dummy>')
def index(dummy=None):
    with open('server.html') as file_:
        return file_.read()


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '5000'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    (options, args) = parser.parse_args()
    app.debug = True
    app.run(host=options.hostname, port=int(options.port))
