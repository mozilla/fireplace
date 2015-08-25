/*
    Content filtering (whether to show apps, websites, or both).
*/
define('content_filter',
    ['core/capabilities', 'core/l10n', 'core/log', 'core/settings',
     'core/storage', 'core/utils', 'core/views', 'core/z', 'underscore'],
    function(caps, l10n, log, settings,
             storage, utils, views, z, _) {
    'use strict';
    var logger = log('content_filter');
    var gettext = l10n.gettext_lazy;
    // Use the caps.os for a more fine grained definition of "desktop".
    var isDesktop = caps.os.type === 'desktop';

    var EXCLUDE_CONTENT_FILTER_ENDPOINTS = [
        // Don't do content filtering for these endpoints.
        'feed', 'feed-app', 'feed-brand', 'feed-collection', 'feed-shelf',
        'games-daily', 'games-listing'];

    var CONTENT_FILTER_CHOICES = [
        ['all', gettext('all content')],
        ['webapp', gettext('apps')],
        ['website', gettext('websites')]
    ];

    var filterContentLSKey = 'filter-content';
    var filterContent = storage.getItem(filterContentLSKey) || 'all';
    if (['webapp', 'website'].indexOf(filterContent) === -1) {
        filterContent = 'all';
    }

    z.body.on('change', '.content-filter', function() {
        // Update content preferences and reload view to refresh changes.
        if (this.value === undefined) {
            return;
        }
        filterContent = this.value;
        storage.setItem(filterContentLSKey, filterContent);
        logger.log('Filtering content: ' + filterContent);
        views.reload();
    });

    function apiArgs(endpoint) {
        // Return API args to use for API router's processor.
        if (EXCLUDE_CONTENT_FILTER_ENDPOINTS.indexOf(endpoint) !== -1) {
            return {};
        }
        return {
            doc_type: settings.meowEnabled ? filterContent : 'webapp'
        };
    }

    function getFilterContent() {
        return filterContent;
    }

    return {
        CONTENT_FILTER_CHOICES: CONTENT_FILTER_CHOICES,
        apiArgs: apiArgs,
        get enabled() {
            return settings.meowEnabled && !isDesktop;
        },
        getFilterContent: getFilterContent
    };
});
