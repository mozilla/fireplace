import random
from cgi import escape
from datetime import date, timedelta


XSS = False

xss_text = '"\'><script>alert("poop");</script><\'"'
dummy_text = 'foo bar zip zap cvan fizz buzz something something'.split()

def text(default):
    return xss_text if XSS else default

def ptext(len=10):
    return text(' '.join(random.choice(dummy_text) for i in xrange(len)))


def rand_bool():
    return random.choice((True, False))


def category(slug, name):
    return {
        'name': text(name),
        'slug': slug,
    }


MESSAGES = [
    ['be careful, cvan made it', 'loljk'],
    ["it's probably a game or something"],
    None
]

SCREENSHOT_MAP = [
    (70, 70367),
    (78, 78540),
    (72, 72384),
]

def _app_preview():
    url = ('https://marketplace-dev-cdn.allizom.org/'
           'img/uploads/previews/%%s/%d/%d.png' %
               random.choice(SCREENSHOT_MAP))
    return {
        'caption': ptext(5),
        'filetype': 'image/png',
        'thumbnail_url': url % 'thumbs',
        'image_url': url % 'full',
    }


def app(name, slug, **kwargs):
    # In the API everything here except `user` should be serialized and
    # keyed off app_id:region:locale.
    data = {
        'name': text(name),
        'slug': random.choice(dummy_text),
        'summary': escape(kwargs.get('summary', ptext(50))),
        'description': escape(kwargs.get('description', ptext(100))),
        'is_packaged': False,
        'manifest_url':
            'http://%s%s.testmanifest.com/manifest.webapp' % (ptext(1), random.randint(1, 50000)),  # Minifest if packaged
        'current_version': {
            'version': text('%d.0' % int(random.random() * 20)),
            'release_notes': kwargs.get('release_notes', ptext())
        },
        'icons': {
            16: '/media/img/icons/firefox-beta.png',
            48: '/media/img/icons/firefox-beta.png',
            64: '/media/img/icons/firefox-beta.png',
            128: '/media/img/icons/firefox-beta.png'
        },
        'previews': [_app_preview() for i in range(4)],
        'listed_authors': [
            {'name': text('basta')},
            {'name': text('cvan')},
            {'name': text('Chris Van Halen')}
        ],
        'ratings': {
            'average': random.random() * 4 + 1,
            'count': int(random.random() * 500),
        },
        'notices': random.choice(MESSAGES),
        'support_email': text('support@%s.com' % slug),
        'homepage': 'http://marketplace.mozilla.org/',
        'privacy_policy': kwargs.get('privacy_policy', ptext()),
        'public_stats': False,
        'upsell': False,
        # or { // False if no upsell or not available in user region.
        #    slug: 'slug',
        #    name: name,
        #    icons: ...,
        # },
        'content_ratings': {
            'dejus': {'name': '12', 'description': text('Ask your parents')},
            'esrb': {'name': 'L', 'description': text('L for BASTA')},
        },
    }

    price = (None if random.choice((True, False)) else
             '%.2f' % (random.random() * 10))

    if price:
        data.update(price=price, price_locale='$%s' % price)

    data.update(app_user_data(slug))
    return data


def app_user_data(slug=None):
    data = {
        'user': {
            'owns': rand_bool(),
            'has_rated': rand_bool(),
            'can_rate': rand_bool(),
        }
    }
    if random.choice((True, False)):
        data['price'] = '$%.2f' % (random.random() * 10)
    if data['user']['can_rate']:
        data['rating'] = random.randint(1, 5)
        data['user']['has_rated'] = rand_bool()

    # Conditional slugs for great debugging.
    if slug == 'has_rated':
        data['user']['has_rated'] = True
        data['user']['can_rate'] = True
    elif slug == 'can_rate':
        data['user']['has_rated'] = False
        data['user']['can_rate'] = True
    elif slug == 'cant_rate':
        data['user']['can_rate'] = False
    elif slug == 'owns':
        data['user']['owns'] = True
    elif slug == 'free':
        data['price'] = None

    return data


def app_user_review(slug, **kwargs):
    data = {
        'body': kwargs.get('review', ptext()),
        'rating': 4
    }
    return data


user_names = ['Cvan', 'Basta', 'Davor', 'Queen Krupa']

def rand_posted():
    rand_date = date.today() - timedelta(days=random.randint(0, 600))
    return rand_date.strftime('%b %d %Y %H:%M:%S')

def rating():
    version = None
    if random.choice((True, False)):
        version = {
            'name': random.randint(1, 3),
            'latest': False,
        }
    report_spam = '/api/v1/apps/rating/%d/flag/' % random.randint(1000, 9999)

    return {
        'rating': 4,
        'body': ptext(20),
        'is_flagged': random.randint(1, 5) == 1,
        'is_author': random.randint(1, 5) == 1,
        'posted': rand_posted(),
        'report_spam': report_spam,
        'user': {
            'display_name': text(random.choice(user_names)),
            'id': random.randint(1000, 9999),
        },
        'version': version,
    }
