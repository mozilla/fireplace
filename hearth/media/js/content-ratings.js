define('content-ratings', ['urls'], function(urls) {
    'use strict';

    function _rating_path(path) {
        return urls.media('img/icons/ratings/' + path);
    }

    // Map IARC stuff to their icons. Wow, much icons.
    var rating_icons = {
        'classind': {
            '0': _rating_path('CLASSIND_L.png'),
            '10': _rating_path('CLASSIND_10.png'),
            '12': _rating_path('CLASSIND_12.png'),
            '14': _rating_path('CLASSIND_14.png'),
            '16': _rating_path('CLASSIND_16.png'),
            '18': _rating_path('CLASSIND_18.png'),
        },
        'esrb': {
            '0': _rating_path('ESRB_e.png'),
            '10': _rating_path('ESRB_e10.png'),
            '13': _rating_path('ESRB_t.png'),
            '17': _rating_path('ESRB_m.png'),
            '18': _rating_path('ESRB_ao.png'),
        },
        'generic': {
            '3': _rating_path('generic_3.png'),
            '7': _rating_path('generic_7.png'),
            '12': _rating_path('generic_12.png'),
            '16': _rating_path('generic_16.png'),
            '18': _rating_path('generic_18.png'),
        },
        'pegi': {
            '3': _rating_path('pegi_3.png'),
            '7': _rating_path('pegi_7.png'),
            '12': _rating_path('pegi_12.png'),
            '16': _rating_path('pegi_16.png'),
            '18': _rating_path('pegi_18.png'),
        },
        'usk': {
            '0': _rating_path('USK_0.png'),
            '6': _rating_path('USK_6.png'),
            '12': _rating_path('USK_12.png'),
            '16': _rating_path('USK_16.png'),
            '18': _rating_path('USK_18.png'),
            'rating-refused': _rating_path('USK_RR.png'),
        }
    };

    var descriptor_icons = {
        'pegi': {
            'discrimination': _rating_path('descriptors/pegi_discrimination.png'),
            'drugs': _rating_path('descriptors/pegi_drugs.png'),
            'gambling': _rating_path('descriptors/pegi_gambling.png'),
            'lang': _rating_path('descriptors/pegi_language.png'),
            'nudity': _rating_path('descriptors/pegi_nudity.png'),
            'online': _rating_path('descriptors/pegi_online.png'),
            'scary': _rating_path('descriptors/pegi_fear.png'),
            'sex': _rating_path('descriptors/pegi_sex.png'),
            'violence': _rating_path('descriptors/pegi_violence.png'),

            'digital-purchases': _rating_path('descriptors/pegi_inapp_purchase_option.png'),
            'shares-info': _rating_path('descriptors/pegi_personal_data_sharing.png'),
            'shares-location': _rating_path('descriptors/pegi_location_data_sharing.png'),
            'users-interact': _rating_path('descriptors/pegi_social_interaction_functionality.png'),
        }
    };

    var interactive_icons = {
        // Only show the ESRB-branded interactive Elements icons for ESRB.
        'esrb': {
            'digital-purchases': _rating_path('interactives/ESRB_digital-purchases.png'),
            'shares-info': _rating_path('interactives/ESRB_shares-info.png'),
            'shares-location': _rating_path('interactives/ESRB_shares-location.png'),
            'users-interact': _rating_path('interactives/ESRB_users-interact.png'),
        },
        // CLASSIND doesn't want to show Interactive Elements as part of their rating.
        'classind': {},
    };

    var detail_links = {
        // TODO: replace classind link with one the IARC will give us.
        // TODO: link to a detail page for generic content ratings (MDN?).
        'classind': 'http://portal.mj.gov.br/classificacao/data/Pages/MJ6BC270E8PTBRNN.htm',
        'esrb': 'http://www.esrb.org/ratings/ratings_guide.jsp',
        'pegi': 'http://www.pegi.info/en/index/id/33/',
        'usk': 'http://www.usk.de/pruefverfahren/alterskennzeichen/',
    };

    // Language icons.
    if (window.navigator.l10n.language == 'es') {
        rating_icons.esrb = {
            '0': _rating_path('esrb_e_spa.png'),
            '10': _rating_path('esrb_e10_spa.png'),
            '13': _rating_path('esrb_t_spa.png'),
            '17': _rating_path('esrb_m_spa.png'),
            '18': _rating_path('esrb_ao_spa.png'),
        };
    }

    return {
        descriptor_icons: descriptor_icons,
        detail_links: detail_links,
        interactive_icons: interactive_icons,
        rating_icons: rating_icons,
    };
});
