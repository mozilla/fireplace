import os
import time
from functools import wraps
from optparse import OptionParser

import requests
from flask import Flask, make_response, request
app = Flask("Flue")


FLUE = 'http://flue.paas.allizom.org'
# MARKETPLACE = 'http://localhost:8000'
MARKETPLACE = 'https://marketplace-dev.allizom.org'

IGNORED_HEADERS = ('transfer-encoding', 'content-encoding', 'connection')
LATENCY = 0


ar = app.route
@wraps(ar)
def latencify(*args, **kwargs):
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            if LATENCY:
                time.sleep(LATENCY)
            return func(*args, **kwargs)

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = latencify


def _qs():
    return request.url[len(request.base_url):].lstrip('?')

def _urlparams(url):
    qs = _qs()
    if not qs:
        return url
    qs += '&format=json'
    if '?' not in url:
        url += '?'
    else:
        url += '&'

    return url + qs


def _proxy(url):
    url = _urlparams(url)
    if request.method == 'POST':
        print 'POSTing %s' % url
        req = requests.post(url, request.form)
    elif request.method == 'DELETE':
        print 'DELETing %s' % url
        req = requests.delete(url)
    else:
        print 'GETing %s' % url
        req = requests.get(url)

    resp = make_response(req.text, req.status_code)
    for header, val in req.headers.items():
        if header.lower() in IGNORED_HEADERS:
            continue
        resp.headers[header] = val

    return resp


@app.route('/app/<slug>/reviews/self', methods=['POST'])
def reviews_self(slug):
    req = requests.post(MARKETPLACE + '/api/v1/apps/rating/',
                        {app: slug, body: request.args.get('body'),
                         rating: request.args.get('rating')})
    return req.text


@app.route('/app/<slug>/reviews/self', methods=['DELETE'])
def reviews_self_delete(slug):
    return _proxy(MARKETPLACE + '/api/v1/apps/rating/?app=%s' % slug)


@app.route('/app/<slug>/reviews/self', methods=['GET'])
def reviews_self_get(slug):
    return _proxy(MARKETPLACE + '/api/v1/apps/rating/?app=%s' % slug)


# PARITY


@app.route('/api/v1/apps/rating/')
def app_ratings():
    return _proxy(FLUE + request.path)


# MERGED


@app.route('/api/v1/apps/search/creatured/')
def category():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/abuse/app/', methods=['POST'])
def user_abuse():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/abuse/user/', methods=['POST'])
def app_abuse():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/account/login/', methods=['POST'])
def login():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/account/settings/mine/', methods=['GET', 'POST'])
def settings():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/account/installed/mine/')
def settings():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/home/featured/')
def featured():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/account/feedback/', methods=['POST'])
def feedback():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/home/page/')
def homepage():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/apps/category/')
def categories():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/apps/app/<slug>/')
def app_(slug):
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/v1/apps/search/')
def search():
    return _proxy(MARKETPLACE + request.path)


@app.route('/terms-of-use.html', methods=['GET'])
def terms():
    return _proxy(MARKETPLACE + request.path)


@app.route('/privacy-policy.html', methods=['GET'])
def privacy():
    return _proxy(MARKETPLACE + request.path)


@app.route('/api/receipts/install/')
def receipts(slug):
    return _proxy(MARKETPLACE + request.path)


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
