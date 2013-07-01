define('defer', ['jquery'], function($) {
    return {Deferred: $.Deferred,
            when: $.when};
});
