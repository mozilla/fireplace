define('paginator', ['z'], function(z) {

    function init() {
        z.page.on('click', '.loadmore button', function(e) {
            // Get the button.
            var button = $(this);
            // Get the container.
            var swapEl = button.parents('.loadmore');
            // Show a loading indicator.
            swapEl.addClass('loading');
            swapEl.append('<div class="throbber">');
            // Grab the url to fetch the data from.
        });
    }
    return {init: init};
});
