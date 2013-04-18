import os
from gettext import gettext as _
from optparse import OptionParser

import requests
from flask import Flask, make_response, render_template, request

from templating import render, setup_templates
from urls import api_url

static_path = '../hearth/media/'
app = Flask("Flue", static_url_path='/media', static_folder=static_path)
setup_templates(app)


@app.route('/')
def homepage():
    return render(
        'category/main.html',
        endpoint=api_url('category', ['']),
        category_name=_('All Categories'),
        sort=None)


if __name__ == '__main__':
    parser = OptionParser()

    # kiss me thru the phone
    parser.add_option('--port', dest='port',
            help='port', metavar='PORT', default=os.getenv('PORT', '6789'))
    parser.add_option('--host', dest='hostname',
            help='hostname', metavar='HOSTNAME', default='0.0.0.0')
    parser.add_option('--latency', dest='latency',
            help='latency (sec)', metavar='LATENCY', default=0)
    (options, args) = parser.parse_args()
    app.debug = True
    app.run(host=options.hostname, port=int(options.port))
