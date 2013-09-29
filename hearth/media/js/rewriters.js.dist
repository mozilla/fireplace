define('rewriters', ['log'], function(log) {
    var console = log('rewriters');

    /*
    This module is in charge of rewriting the cache as new cache entries would
    otherwise be created. This is useful for pagination, but can be adapted to
    other use cases.

    The module is expected to return a list of rewriters.

    A rewriter is expected to be a function which accepts three arguments:

    - new_key: The key of a new value being added to the cache.
    - new_value: The value being added to the cache.
    - cache: The raw key/value store containing the cache (an object).

    This function's return value has the following behavior:
    - `undefined`: The caching module continues; the rewriter is ignored.
    - `null`: The caching module aborts saving the new value.
    */

    return [];
});
