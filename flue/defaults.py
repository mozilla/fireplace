import random


dummy_text = 'foo bar zip zap cvan fizz buzz something something'.split()

def ptext(len=10):
    return ' '.join(random.choice(dummy_text) for i in xrange(len))


def category(slug, name):
    return {
        'name': name,
        'slug': slug,
    }


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
        'thumbURL': url % 'thumbs',
        'fullURL': url % 'full',
    }


def app(name, slug, **kwargs):
    return {
        'name': name,
        'slug': random.choice(dummy_text),
        'summary': kwargs.get('summary', ptext(50)),
        'description': kwargs.get('description', ptext(100)),
        'is_packaged': False,
        'manifest_url':
            'http://%s%s.testmanifest.com/manifest.webapp' % (ptext(1), random.randint(1, 50000)),  # Minifest if packaged
        'current_version': {
            'version': '%d.0' % int(random.random() * 20),
            'release_notes': kwargs.get('release_notes', ptext())
        },
        'icons': {
            16: '/media/img/icons/firefox-beta.png',
            48: '/media/img/icons/firefox-beta.png',
            64: '/media/img/icons/firefox-beta.png',
            128: '/media/img/icons/firefox-beta.png'
        },
        'previews': [_app_preview() for i in range(3)],
        'image_assets': {
            'desktop_tile': ['/media/img/icons/firefox-beta.png',
                             int(random.random() * 255)],
            'featured_tile': ['/media/img/icons/firefox-beta.png',
                              int(random.random() * 255)],
            'mobile_tile': ['/media/img/icons/firefox-beta.png',
                            int(random.random() * 255)],
        },
        'listed_authors': [
            {'name': 'basta'},
            {'name': 'cvan'}
        ],
        'price': '0.00',
        'ratings': {
            'average': random.random() * 4 + 1,
            'count': int(random.random() * 500),
        },
        'notices': [
            'be careful, cvan made it.',
            'lol jk'
        ],
        'support_email': 'support@%s.com' % slug,
        'homepage': 'http://marketplace.mozilla.org/',
        'privacy_policy': kwargs.get('privacy_policy', ptext()),
        'public_stats': False,
        'upsell': False,
        # or { // False if no upsell or not available in user region.
        #    url: '/app/<id>'
        #    name: name,
        #    icons: ...,
        #},
        'content_ratings': {
            'dejus': {'name': 'M', 'description': 'rating desc'},
            'esrb': {'name': 'C', 'description': 'C for CVERYONE'},
        },
        'user': {
            'owns': random.choice((True, False))
        }
    }


user_names = ['Cvan', 'Basta', 'Potch', 'Queen Krupa']

def rating(has_reply=False):
    return {
        'id': random.randint(1000, 9999),
        'user_name': random.choice(user_names),
        'rating': 4,
        'body': ptext(20),
        'reply': None if not has_reply else rating(),
        'for_old_version': False,  # False or the old version number
        'is_flagged': False
    }
