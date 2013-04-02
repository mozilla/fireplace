import os
from optparse import OptionParser

import requests
from flask import Flask, make_response, request
app = Flask("Flue")


FLUE = 'http://flue.paas.allizom.org'
# MARKETPLACE = 'http://localhost:8000'
MARKETPLACE = 'https://marketplace-dev.allizom.org'

IGNORED_HEADERS = ('transfer-encoding', 'content-encoding', 'connection')


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
    else:
        print 'GETing %s' % url
        req = requests.get(url)

    resp = make_response(req.text, req.status_code)
    for header, val in req.headers.items():
        if header.lower() in IGNORED_HEADERS:
            continue
        resp.headers[header] = val

    return resp


@app.route('/user/login', methods=['POST'])
def login():
    return _proxy(MARKETPLACE + '/api/account/login/')


@app.route('/user/settings', methods=['GET', 'POST'])
def settings():
    return _proxy(MARKETPLACE + '/api/account/settings/mine/')


@app.route('/user/<slug>/abuse', methods=['POST'])
def user_abuse(slug):
    return _proxy(FLUE + request.path)


@app.route('/user/purchases')
def user_purchases():
    return _proxy(MARKETPLACE + '/api/account/settings/mine/')


@app.route('/app/<slug>/abuse', methods=['POST'])
def app_abuse(slug):
    return _proxy(FLUE + request.path)


@app.route('/feedback', methods=['POST'])
def feedback():
    return _proxy(FLUE + request.path)


@app.route('/terms-of-use', methods=['GET'])
def terms():
    return _proxy(MARKETPLACE + '/terms-of-use.html')


@app.route('/privacy-policy', methods=['GET'])
def privacy():
    return _proxy(MARKETPLACE + '/privacy-policy.html')


@app.route('/app/<slug>/reviews/self', methods=['POST'])
def reviews_self(slug):
    req = requests.post(MARKETPLACE + '/api/apps/rating/',
                        {app: slug, body: self.args.get('body'),
                         rating: self.args.get('rating')})
    return req.text


@app.route('/app/<slug>/reviews/self', methods=['GET'])
def reviews_self_get(slug):
    return _proxy(MARKETPLACE + '/api/apps/rating/?app=%s' % slug)


@app.route('/featured')
def featured():
    return _proxy(FLUE + request.path)


@app.route('/categories')
def categories():
    return _proxy(MARKETPLACE + '/api/apps/category/')


@app.route('/homepage')
def homepage():
    return _proxy(MARKETPLACE + '/api/home/page/')


@app.route('/search')
def search():
    return _proxy(MARKETPLACE + '/api/apps/search/')


@app.route('/category/<slug>')
def category(slug):
    return _proxy(FLUE + request.path)


@app.route('/app/<slug>/ratings')
def app_ratings(slug):
    return _proxy(FLUE + request.path)


@app.route('/app/<slug>')
def app_(slug):
    return _proxy(FLUE + request.path)


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '5000'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    (options, args) = parser.parse_args()
    app.debug = True
    app.run(host=options.hostname, port=int(options.port))
