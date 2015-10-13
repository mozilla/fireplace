define('views/search',
    ['core/l10n', 'core/navigation', 'core/settings', 'core/urls',
     'core/utils', 'core/z', 'previews', 'tracking', 'utils_local'],
    function(l10n, navigation, settings, urls,
             utils, z, previews, tracking, utilsLocal) {
    'use strict';
    var _pd = utils._pd;
    var gettext = l10n.gettext;

    function append(existing_value, new_value) {
        if (typeof existing_value === 'string' && existing_value !== '') {
            return existing_value + ',' + new_value;
        }
        return new_value;
    }

    function parsePotatoSearch(query) {
        // PotatoSearch queries: github.com/mozilla/fireplace/wiki/
        // QuickSearch-(PotatoSearch%E2%84%A2)
        query = query || {q: ''};

        // We keep track of the full query separately, since we don't want
        // to send it as `q` to the API.
        query.full_q = query.q || '';
        query.q = [];

        query.full_q.split(' ').forEach(function(value) {
            if (!value) {return;}
            if (value[0] === ':') {
                value = value.slice(1);
                if (value === 'hosted' || value === 'packaged' ||
                    value === 'privileged') {
                    query.app_type = append(query.app_type, value);
                } else if (value === 'free' || value === 'free-inapp') {
                    query.premium_types = append(query.premium_types, value);
                } else if (value === 'premium' || value === 'paid') {
                    query.premium_types = append(query.premium_types,
                                                 'premium');
                } else if (value === 'premium-inapp' ||
                           value === 'paid-inapp') {
                    query.premium_types = append(query.premium_types,
                                                 'premium-inapp');
                } else if (value === 'premium-other' ||
                           value === 'paid-other') {
                    query.premium_types = append(query.premium_types,
                                                 'premium-other');
                } else if (value.indexOf('cat=') === 0) {
                    query.cat = value.split('=')[1];
                } else if (value === 'desktop' || value === 'firefoxos') {
                    query.dev = append(query.dev, value);
                } else if (value === 'tablet' || value === 'mobile') {
                    query.dev = append(query.dev, 'android');
                    query.device = append(query.device, value);
                    // TODO: Add ":compatible" mode that triggers buchet
                    // filtering on desktop.
                } else if (value.indexOf('sort=') === 0) {
                    query.sort = append(query.sort, value.split('=')[1]);
                } else if (value === 'popular') {
                    query.sort = 'downloads';
                } else if (value === 'new') {
                    query.sort = 'reviewed';
                } else if (value.indexOf('manifest=') === 0 ||
                           value.indexOf('manifest_url=') === 0) {
                    query.manifest_url = value.split('=')[1];
                } else if (value.indexOf('pro=') === 0) {
                    query.pro = value.split('=')[1];
                } else if (value.indexOf('languages=') === 0 ||
                           value.indexOf('language=') === 0 ||
                           value.indexOf('langs=') === 0 ||
                           value.indexOf('lang=') === 0) {
                    query.languages = append(query.languages,
                                             value.split('=')[1]);
                } else if (value.indexOf('region=') === 0) {
                    query.region = value.split('=')[1];
                } else if (value.indexOf('offline') === 0) {
                    query.offline = 'True';
                } else if (value.indexOf('online') === 0) {
                    query.offline = 'False';
                } else if (value.indexOf('tarako') === 0) {
                    query.tag = 'tarako';
                }
            } else {
                // Include anything not a keyword in the `q` search term.
                query.q.push(value);
            }
        });

        // What gets sent to the API.
        query.q = query.q.join(' ');

        if (query.q === query.full_q) {
            // No keywords, remove full_q.
            delete query.full_q;
        }

        return query;
    }

    z.body.on('submit', '.header--search-form', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // A mapping of query => view name that can be used to navigate to a
        // specific view via search box. Mostly used for automated testing.
        var potato_views = {
            ':categories': 'categories',
            ':debug': 'debug',
            ':debug_features': 'debug_features',
            ':feedback': 'feedback',
            ':homepage': 'homepage',
            ':new_apps': 'new',
            ':newsletter': 'newsletter_signup',
            ':popular_apps': 'popular',
            ':privacy': 'privacy',
            ':recommended': 'recommended',
            ':settings': 'settings',
            ':terms': 'terms',
        };
        var $q = $('#search-q');
        var query = $q.val();
        if (Object.keys(potato_views).indexOf(query) > -1) {
            z.page.trigger('navigate', urls.reverse(potato_views[query]));
            $q.val('');
            return;
        } else if (query === ':' || query === ':help') {
            window.open('https://github.com/mozilla/fireplace/wiki/' +
                        'QuickSearch-(PotatoSearch™)');
            $q.val('');
            return;
        }
        $q.trigger('blur');
        z.page.trigger('search', {q: query});
        return;
    });

    // On FxOS 1.1 the search form did not submit
    // after hitting enter (so it did not work).
    z.body.on('keydown', '#search-q', function(e) {
        if(e.keyCode==13) { // Enter key
            //$("#search")[0].submit();
            var potato_views = {
                ':categories': 'categories',
                ':debug': 'debug',
                ':debug_features': 'debug_features',
                ':feedback': 'feedback',
                ':homepage': 'homepage',
                ':new_apps': 'new',
                ':newsletter': 'newsletter_signup',
                ':popular_apps': 'popular',
                ':privacy': 'privacy',
                ':recommended': 'recommended',
                ':settings': 'settings',
                ':terms': 'terms',
            };
            var $q = $('#search-q');
            var query = $q.val();
            if (Object.keys(potato_views).indexOf(query) > -1) {
                z.page.trigger('navigate', urls.reverse(potato_views[query]));
                $q.val('');
                return;
            } else if (query === ':' || query === ':help') {
                window.open('https://github.com/mozilla/fireplace/wiki/' +
                            'QuickSearch-(PotatoSearch™)');
                $q.val('');
                return;
            }
            $q.trigger('blur');
            z.page.trigger('search', {q: query});
            return;
        }
    });

    z.page.on('loaded_more', function() {
        previews.initialize();
        // Update "Showing 1-{total}" text.
        z.page.find('.total-results').text(z.page.find('.item.app').length);
    })

    .on('search', _pd(function(e, params) {
        return z.page.trigger('navigate', [
            utils.urlparams(urls.reverse('search'), params),
            {search_query: params.q}
        ]);
    }));

    function processor(query) {
        // Whimsy or extras go here.
        query = query ? query.toLowerCase() : '';
        return function(data) {
            return data;
        };
    }

    return function(builder, args, params) {
        params = parsePotatoSearch(params);
        if ('sort' in params && params.sort === 'relevancy') {
            delete params.sort;
        }
        var queryParams = ['full_q', 'q', 'author'];
        var queryParam;
        var query;
        var title = gettext('Search Results');
        var pageTypes = 'search app-list';

        // Get the first valid param and record its type.
        for (var i = 0; i < queryParams.length; i++) {
            queryParam = queryParams[i];
            query = params[queryParam];
            if (query) break;
        }

        if (query && queryParam === 'author') {
            pageTypes += ' leaf';
            utilsLocal.headerTitle(gettext('Developer Listing'));
        } else if (!settings.meowEnabled) {
            pageTypes += ' leaf';
        }

        builder.z('type', pageTypes);
        builder.z('search', query);
        builder.z('title', query || title);


        builder.start('search.html', {
            endpoint_name: 'search',
            params: params,
            processor: processor(query),
            raw_query: query || document.querySelector('[name="q"]').value,
        }).done(function() {
            var results = builder.results.searchresults;

            if (params.manifest_url && results.objects.length === 1) {
                z.page.trigger(
                    'divert',
                    [urls.reverse('app', [results.objects[0].slug]) +
                     '?src=' + params.src]);
            }

            // Tell GA when no results (bug 890314).
            if (!results.objects.length) {
                tracking.sendEvent('No results found', 'Search', query);
            }
        });
    };
});
