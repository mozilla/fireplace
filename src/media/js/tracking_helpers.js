define('tracking_helpers',
    ['log', 'navigation', 'tracking'],
    function(log, navigation, tracking) {

    var console = log('tracking', 'helpers');

    function track_search_term(page) {
        // `page` should be a truthy value representing whether the search
        // query is being tracked for a page view.
        var nav_stack = navigation.stack();
        for (var i = 0, item; item = nav_stack[i++];) {
            if (!item.params || !item.params.search_query) {
                continue;
            }
            console.log('Found search in nav stack, tracking search term:', item.params.search_query);
            tracking[page ? 'setPageVar' : 'setVar'](13, 'Search query', item.params.search_query);
            return;
        }
        console.log('No associated search term to track.');
    }

    return {'track_search_term': track_search_term};
});
