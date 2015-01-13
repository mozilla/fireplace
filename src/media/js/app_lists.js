define('app_lists', ['z'], function(z) {
    // Remove paginated class from app lists if .loadmore goes away.
    z.page.on('loaded_more', function() {
        if (!$('.loadmore').length) {
            $('.app-list').removeClass('paginated');
        }
    });
});
