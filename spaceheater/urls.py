import re
from urllib import urlencode
from urlparse import parse_qs

import settings


def strip_ws(data):
    return data.replace('\n', '').replace('\r', '')


API_ROUTES = {}
URL_ROUTES = []

with open('../hearth/media/js/urls.js') as urls_js:
    url_data = urls_js.read()
    arp = re.compile(r'api_endpoints = (\{.+?\});', re.DOTALL)
    arp_data = strip_ws(arp.search(url_data).group(1))
    # shame on me
    API_ROUTES = eval(arp_data)

with open('../hearth/media/js/routes.js') as routes_js:
    url_data = routes_js.read()
    urp = re.compile(r'routes = (\[.+?\]);', re.DOTALL)
    url_data = strip_ws(urp.search(url_data).group(1))
    # shame on me
    URL_ROUTES = eval(url_data)

    # # Convert regex patterns to compiled regexes
    # for route in URL_ROUTES:
    #     route['re'] = re.compile(route['pattern'])


GROUP_PATTERN = re.compile(r'\(.+?\)')


def _qs(url):
    if '?' not in url:
        return url, ''
    qpos = url.index('?')
    return url[:qpos], url[qpos + 1:]


def _urlparams(url, **kw):
    base, qs = _qs(url)

    args = parse_qs(qs)
    args.update(kw)

    return '%s?%s' % (base, urlencode(args))


def _userargs(func):
    def wrap(*args, **kwargs):
        url = func(*args, **kwargs)
        # TODO: Implement this.
        # TODO: Also implement user tokens from cookies.
        url = _urlparams(url, lang='unknown', region='unknown')
        return url
    return wrap


def urlunparam(url, params): 
    base, qs = _qs(url)

    args = parse_qs(qs)
    for param in params:
        if param in args:
            del args[param]

    return '%s?%s' % (base, urlencode(args))


@_userargs
def api_url(path, args=None):
    if not args:
        args = []
    if path not in API_ROUTES:
        raise Exception('API route not found: %s' % path)
    return settings.api_url + API_ROUTES[path].format(*args)


def api_apiParams(path, **kw):
    return _urlparams(api_url(path), **kw)


def reverse(view_name, args=None):
    if not args:
        args = []

    for route in URL_ROUTES:
        if route['view_name'] != view_name:
            continue

        url = route['pattern'][1:-1]  # Strip the first and last chars.
        arg_groups = GROUP_PATTERN.findall(url)
        if not arg_groups:
            return url
        for i, _ in enumerate(arg_groups):
            url = GROUP_PATTERN.sub('{%d}' % i, url)

        if len(args) != len(arg_groups):
            raise Exception('Wrong number of arguments passed to reverse()')

        return url.format(*args)
