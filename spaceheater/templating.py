import copy
import gettext
import json
import os
from cgi import escape

from flask import render_template
from jinja2 import FileSystemLoader, Markup

import urls
import settings


template_path = '../hearth/templates/'

helpers = {
    'api': urls.api_url,
    'apiParams': urls.api_apiParams,
    'url': urls.reverse,

    'settings': settings,
    '_': lambda string, **kw:
        Markup(gettext.gettext(string).format(**kw)),
    '_plural': lambda sin, plu, **kw:
        Markup(gettext.ngettext(sin, plu, kw.get('n')).format(**kw)),
}


def make_data_attrs(obj):
    if not obj:
        return ''
    return ' '.join(
        'data-%s="%s"' % (escape(k), escape(v)) for
        k, v in obj.iteritems())


def setup_templates(app):
    # Load in template our extensions.
    app.jinja_options = dict(app.jinja_options)
    app.jinja_options['extensions'].append('defer_ext.Defer')

    app.jinja_loader = FileSystemLoader(
        os.path.join(os.path.dirname(__file__), template_path))

    app.jinja_env.globals.update(helpers)
    app.jinja_env.filters['format'] = lambda s, **kw: s.format(**kw)
    app.jinja_env.filters['stringify'] = json.dumps
    app.jinja_env.filters['urlparams'] = urls._urlparams
    app.jinja_env.filters['urlunparam'] = urls.urlunparam
    app.jinja_env.filters['make_data_attrs'] = make_data_attrs

    print 'Jinja2 Template Loader side-loaded'


# Read in the base template.
with open(os.path.join(os.path.dirname(__file__),
          '../hearth/server.html')) as base_template_file:
    server_html = base_template_file.read()
    server_html = server_html.replace(
        'data-spaceheater="false"', 'data-spaceheater="true"')

def render(template, **kw):
    out = render_template(template, **kw)
    return server_html.replace('<!--{{ data }}-->', out)
