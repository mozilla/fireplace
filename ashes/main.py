import json
import hashlib
import hmac
import os
import sys
import time
import urllib
import urllib2
import uuid
from functools import wraps
from optparse import OptionParser

from flask import Flask, make_response, redirect, render_template, request
app = Flask("Ashes")

SECRET = uuid.uuid4().hex
DEBUG = True

import pymongo

if 'VMC_APP_PORT' in os.environ:
    port = int(os.getenv('VMC_APP_PORT'))
    j = json.loads(os.getenv('VMC_SERVICES'))
    mongodb = j[0]
else:
    # this is localhost
    port = 8888
    mongodb = dict(options=dict(
        hostname='localhost', port=27017, db='db'))

if 'username' in mongodb['options']:
    mongouri = 'mongodb://{username}:{password}@{hostname}:{port}/{db}'
else:
    mongouri = 'mongodb://{hostname}:{port}'
mongouri = mongouri.format(**mongodb['options'])

try:
    mongo = pymongo.Connection(mongouri)
    db = mongo.db
except Exception:
    print "MongoDB not found"
    sys.exit()


def sslify(resp):
    resp.headers['Strict-Transport-Security'] = 'max-age=31536000'

ar = app.route
@wraps(ar)
def corsify(*args, **kwargs):
    methods = kwargs.get('methods') or ['GET']
    def decorator(func):
        @wraps(func)
        def wrap(*args, **kwargs):
            # Don't allow insecure connections in prod.
            if (False and
                not request.url.startswith('https:') and
                not DEBUG):
                redir = redirect(request.url.replace('http:', 'https:', 1),
                                 code=301)
                redir.headers['Redirecting-From'] = request.url
                sslify(redir)
                return redir

            resp = func(*args, **kwargs)
            if isinstance(resp, (dict, list, tuple)):
                resp = make_response(json.dumps(resp, indent=2), 200)
                resp.headers['Content-type'] = 'application/json'
                resp.headers['Access-Control-Allow-Origin'] = '*'
                resp.headers['Access-Control-Allow-Methods'] = ','.join(methods)
                resp.headers['Access-Control-Allow-Headers'] = 'X-HTTP-METHOD-OVERRIDE'
            else:
                resp = make_response(resp, 200)

            # Make the request secure.
            if not DEBUG:
                sslify(resp)
            return resp

        if 'methods' in kwargs:
            kwargs['methods'].append('OPTIONS')

        registered_func = ar(*args, **kwargs)(wrap)
        registered_func._orig = func
        return registered_func

    return decorator

app.route = corsify


def verify_assertion(assertion):
    query_args = {
        'assertion': assertion,
        'audience': 'https://ashes.paas.allizom.org',
        # 'audience': 'http://localhost:5000',
    }
    encoded_args = urllib.urlencode(query_args)
    url = 'https://verifier.login.persona.org/verify'
    output = urllib2.urlopen(url, urllib.urlencode(query_args)).read()
    print output
    data = json.loads(output)
    if data['status'] != 'okay':
        raise Exception('Assertion invalid')
    email = data['email']
    if not email.endswith('@mozilla.com'):
        raise Exception('Only Mozilla emails allowed')
    return email


_consumer_id = lambda email: hashlib.sha1(email + SECRET).hexdigest()


def get_token(email):
    unique_id = uuid.uuid4().hex
    consumer_id = _consumer_id(email)

    hm = hmac.new(
        unique_id + SECRET, consumer_id, hashlib.sha512)
    return ','.join((hm.hexdigest(), unique_id))


def confirm_token(email, token):
    hm, unique_id = token.split(',')
    consumer_id = _consumer_id(email)
    return hmac.new(
        unique_id + SECRET, consumer_id, hashlib.sha512).hexdigest() == hm


@app.route('/auth', methods=['POST'])
def auth():
    assertion = request.form.get('assertion')
    print 'Attempting verification'

    try:
        email = verify_assertion(assertion)
    except Exception as e:
        return make_response('{"error":' + json.dumps(str(e)) + '}', 403)

    if not email:
        return make_response('{"error":"Unauthorized"}', 403)

    # At this point, we know that the user is a valid user.

    return {
        'error': None,
        'token': get_token(email),
        'email': email,
    }


@app.route('/post_report', methods=['POST'])
def post_report():
    body = request.form.get('body')
    try:
        data = json.loads(body)
        data['posted'] = time.time()
    except Exception as e:
        doc = {'error': 'Could not parse document.'}
        if DEBUG:
            doc['message'] = str(e)
        return doc

    uid = data['uid'] = uuid.uuid4().hex[:5]

    report_id = db.reports.insert(data)

    return {
        'error': None,
        'thanks': 'krupa is happier because of you <3',
        'id': uid,
    }


@app.route('/report/<id>')
def report(id):
    email = str(request.args.get('email'))
    token = str(request.args.get('token'))
    print(email, token)
    if not confirm_token(email, token):
        return make_response('{"error":"Unauthorized"}', 403)

    report = db.reports.find_one({'uid': id})
    if not report:
        return make_response('{"error":"Not Found"}', 404)
    del report['_id']
    return report


@app.route('/')
def home():
    return render_template('main.html', **{
        'num_reports': db.reports.count(),
        'num_builds': 0,
    })


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '5000'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    (options, args) = parser.parse_args()
    app.debug = DEBUG
    app.run(host=options.hostname, port=int(options.port))
