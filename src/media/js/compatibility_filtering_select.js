define('compatibility_filtering_select',
    ['compatibility_filtering', 'jquery', 'core/log', 'core/views', 'core/z'],
    function(compatibility_filtering, $, log, views, z) {
    var logger = log('compatibility_filtering_select');

    z.body.on('change', '#compatibility_filtering', function() {
        var value = $(this[this.selectedIndex]).val();
        var endpoint_name = $('#compatibility_filtering_endpoint_name').val();

        if (endpoint_name) {
            // Override stored preferences with the new ones and reload the
            // view to take changes into account.
            compatibility_filtering.set_preference(endpoint_name, value);
            views.reload();
        } else {
            logger.error('Tried to change filtering preferences w/o endpoint');
        }
    });
});
