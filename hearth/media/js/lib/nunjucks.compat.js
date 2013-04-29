define('nunjucks.compat', ['nunjucks'], function(nunjucks) {
    console.log('Loading nunjucks compat...')

    var runtime = nunjucks.require('runtime');
    var lib = nunjucks.require('lib');

    var orig_contextOrFrameLookup = runtime.contextOrFrameLookup;
    runtime.contextOrFrameLookup = function(context, frame, key) {
        var val = orig_contextOrFrameLookup.apply(this, arguments);
        if (val === undefined) {
            switch (key) {
                case 'True':
                    return true;
                case 'False':
                    return false;
                case 'None':
                    return null;
            }
        }

        return val;
    };

    var orig_memberLookup = runtime.memberLookup;
    runtime.memberLookup = function(obj, val, autoescape) {
        obj = obj || {};

        // If the object is an object, return any of the methods that Python would
        // otherwise provide.
        if (lib.isArray(obj)) {
            // Handy list methods.
            switch (val) {
                case 'pop':
                    return function(index) {
                        if (index === undefined) {
                            return obj.pop();
                        }
                        if (index >= obj.length || index < 0) {
                            throw new Error('KeyError');
                        }
                        return obj.splice(index, 1);
                    };
                case 'remove':
                    return function(element) {
                        for (var i = 0; i < obj.length; i++) {
                            if (obj[i] == element) {
                                return obj.splice(i, 1);
                            }
                        }
                        throw new Error('ValueError');
                    };
                case 'count':
                    return function(element) {
                        var count = 0;
                        for (var i = 0; i < obj.length; i++) {
                            if (obj[i] == element) {
                                count++;
                            }
                        }
                        return count;
                    };
                case 'index':
                    return function(element) {
                        var i;
                        if ((i = obj.indexOf(element)) == -1) {
                            throw new Error('ValueError');
                        }
                        return i;
                    };
                case 'find':
                    return function(element) {
                        return obj.indexOf(element);
                    };
                case 'insert':
                    return function(index, elem) {
                        return obj.splice(index, 0, elem);
                    };
            }
        }

        if (lib.isObject(obj)) {
            switch (val) {
                case 'items':
                case 'iteritems':
                    return function() {
                        var ret = [];
                        for(var k in obj) {
                            ret.push([k, obj[k]]);
                        }
                        return ret;
                    };

                case 'values':
                case 'itervalues':
                    return function() {
                        var ret = [];
                        for(var k in obj) {
                            ret.push(obj[k]);
                        }
                        return ret;
                    };

                case 'keys':
                case 'iterkeys':
                    return function() {
                        var ret = [];
                        for(var k in obj) {
                            ret.push(k);
                        }
                        return ret;
                    };

                case 'get':
                    return function(key, def) {
                        var output = obj[key];
                        if (output === undefined) {
                            output = def;
                        }
                        return output;
                    };

                case 'has_key':
                    return function(key) {
                        return key in obj;
                    };

                case 'pop':
                    return function(key, def) {
                        var output = obj[key];
                        if (output === undefined && def !== undefined) {
                            output = def;
                        } else if (output === undefined) {
                            throw new Error('KeyError');
                        } else {
                            delete obj[key];
                        }
                        return output;
                    };

                case 'popitem':
                    return function() {
                        for (var k in obj) {
                            // Return the first object pair.
                            var val = obj[k];
                            delete obj[k];
                            return [k, val];
                        }
                        throw new Error('KeyError');
                    };

                case 'setdefault':
                    return function(key, def) {
                        if (key in obj) {
                            return obj[key];
                        }
                        if (def === undefined) {
                            def = null;
                        }
                        return obj[key] = def;
                    };

                case 'update':
                    return function(kwargs) {
                        for (var k in kwargs) {
                            obj[k] = kwargs[k];
                        }
                        return null;  // Always returns None
                    };
            }
        }

        return orig_memberLookup.apply(this, arguments);
    };

});
