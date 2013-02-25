define('builder',
       ['api', 'helpers', 'models', 'nunjucks', 'settings', 'underscore', 'z', 'nunjucks.compat'],
       function(api, helpers, models, nunjucks, settings, _, z) {

    var applyTemplate = function (template, data) {
        if(_.isArray(data)) {
            return _.map(
                data,
                function(part_data) {
                    var d = _.defaults({this: part_data}, helpers);
                    return nunjucks.env.getTemplate(template).render(d);
                }
            ).join('');
        } else if (_.isObject(data)) {
            data = _.defaults(data, helpers);
            data.this = data;
            return nunjucks.env.getTemplate(template).render(data);
        } else {
            return nunjucks.env.getTemplate(template).render(helpers);
        }
    };

    function builderObj() {
        var requests = [];
        var completed_requests = 0;

        function decrRequests() {
            completed_requests++;
            if (completed_requests >= requests.length) {
                z.page.trigger('loaded');
            }
        }

        var context = _.once(function() {return z.context = {};});
        this.z = function(key, val) {context()[key] = val;};

        function request(fetcher) {
            requests.push(fetcher);

            var ret = {};
            var matched_elements;

            function prepElements(elements) {
                return matched_elements = elements.addClass('loading');
            }

            fetcher.always(function() {
                console.log('Loaded');
                matched_elements.removeClass('loading');

                // This is a hack, but it allows the event handlers to get set
                // in case the deferred returns immediately.
                _.delay(decrRequests, 250);
            }).fail(function(error) {
                console.error('Resource fetch failed :( :( :(', error);
                matched_elements.html(
                    applyTemplate(settings.fragment_error_template, {}));
            });

            function writeSingle(method) {
                return function(selector, template, pluck) {
                    prepElements(z.page.find(selector));

                    return fetcher.done(function(data) {
                        if (pluck !== undefined) {
                            data = data[pluck];
                        }
                        matched_elements[method](applyTemplate(template, data));
                    });
                };
            }

            ret.dest = writeSingle('html');
            ret.append = writeSingle('append');
            ret.prepend = writeSingle('prepend');

            ret.as = function(type) {
                var cast_model = models(type);
                fetcher.done(function(data) {
                    if(_.isArray(data)) {
                        _.each(data, cast_model.cast);
                    } else {
                        cast_model.cast(data);
                    }
                });
                return ret;
            };

            ret.parts = function(parts) {
                // Put a loading indicator on all of the parts.
                prepElements(z.page.find(_.pluck(parts, 'dest').join(', ')));

                return fetcher.done(function(data) {
                    // If jQuery didn't magically parse our JSON, send it for
                    // remediation.
                    if (!_.isObject(data)) {
                        data = JSON.parse(data);
                    }

                    _.each(parts, function(part) {
                        // Create a copy in the local scope so we can overwrite it
                        // safely.
                        var part_data = data;

                        // Pluck specifies a field to "pluck" out of the main
                        // data. Useful for avoiding name collissions (app name,
                        // reviewer name, etc.).
                        if ('pluck' in part) {
                            part_data = part_data[part.pluck];
                        }

                        if (part_data === null || part_data === undefined) {
                            return;
                        }

                        if ('limit' in part) {
                            if (!_.isArray(part_data)) {
                                console.error('Attempted to set limit for non-array in builder part.')
                            } else {
                                part_data = part_data.slice(0, part.limit);
                            }
                        }

                        // If you provide 'as' to the part, it will store that
                        // data in the models.
                        if ('as' in part) {
                            models(part.as).cast(part_data);
                        }

                        var trigger = 'fragment_loaded';
                        if ('trigger' in part) {
                            trigger = part.trigger;
                        }

                        z.page.find(part.dest)
                              .html(applyTemplate(part.template, part_data))
                              .trigger(trigger);

                    });
                });
            };

            return ret;
        }

        // builder.get(<url>).dest('.selector', 'template')
        // builder.get(<url>).as('app').dest('.selector', 'template')
        // builder.get(<url>).parts([{}])
        // builder.get(<url>).as('app').parts([{}])
        this.get = function(url) {
            return request($.get(url));
        };

        // builder.app('slug').dest('.selector', 'template')
        // builder.app('slug').parts([{}])
        this.app = function(slug) {
            var url = api.url('app', [slug]);
            return request(models('app').fetch(url, slug));
        };

        this.rating = function(id) {
            var url = api('ratings', [id]);
            return request(models('rating').fetch(url, id));
        };

        this.start = function(template) {
            z.page.html(applyTemplate(template));
        };

        this.terminate = function() {
            // Abort all ongoing AJAX requests that been flagged as forced.
            _.each(requests, function(request) {
                if (request.abort === undefined || request.isSuccess !== false) {
                    return;
                }
                request.abort();
            });
        };

        this.finish = function() {
            if (!requests.length) {
                decrRequests();
            }
        };
    }

    return {
        getBuilder: function() {return new builderObj();},
    };
});
