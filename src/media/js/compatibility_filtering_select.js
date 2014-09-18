define('compatibility_filtering_select',
    ['compatibility_filtering', 'jquery', 'log', 'views', 'z'],
    function(compatibility_filtering, $, log, views, z) {

    var console = log('compatibility_filtering_select');

    z.body.on('change', '#compatibility_filtering', function() {
        var value = $(this[this.selectedIndex]).val();
        var endpoint_name = $('#compatibility_filtering_endpoint_name').val();

        if (endpoint_name) {
            // Override stored preferences with the new ones and reload the
            // view to take changes into account.
            compatibility_filtering.set_preference(endpoint_name, value);
            views.reload();
        } else {
            console.error('Tried to change filtering preferences without an endpoint');
        }
    });
});
