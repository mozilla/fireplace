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
    var ARRAY_MEMBERS = {
        pop: function(index) {
            if (index === undefined) {
                return obj.pop();
            }
            if (index >= obj.length || index < 0) {
                throw new Error('KeyError');
            }
            return obj.splice(index, 1);
        },
        remove: function(element) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i] == element) {
                    return obj.splice(i, 1);
                }
            }
            throw new Error('ValueError');
        },
        count: function(element) {
            var count = 0;
            for (var i = 0; i < obj.length; i++) {
                if (obj[i] == element) {
                    count++;
                }
            }
            return count;
        },
        index: function(element) {
            var i;
            if ((i = obj.indexOf(element)) == -1) {
                throw new Error('ValueError');
            }
            return i;
        },
        find: function(element) {
            return obj.indexOf(element);
        },
        insert: function(index, elem) {
            return obj.splice(index, 0, elem);
        }
    };
    var OBJECT_MEMBERS = {
        items: function() {
            var ret = [];
            for(var k in obj) {
                ret.push([k, obj[k]]);
            }
            return ret;
        },
        values: function() {
            var ret = [];
            for(var k in obj) {
                ret.push(obj[k]);
            }
            return ret;
        },
        keys: function() {
            var ret = [];
            for(var k in obj) {
                ret.push(k);
            }
            return ret;
        },
        get: function(key, def) {
            var output = obj[key];
            if (output === undefined) {
                output = def;
            }
            return output;
        },
        has_key: function(key) {
            return obj.hasOwnProperty(key);
        },
        pop: function(key, def) {
            var output = obj[key];
            if (output === undefined && def !== undefined) {
                output = def;
            } else if (output === undefined) {
                throw new Error('KeyError');
            } else {
                delete obj[key];
            }
            return output;
        },
        popitem: function() {
            for (var k in obj) {
                // Return the first object pair.
                var val = obj[k];
                delete obj[k];
                return [k, val];
            }
            throw new Error('KeyError');
        },
        setdefault: function(key, def) {
            if (key in obj) {
                return obj[key];
            }
            if (def === undefined) {
                def = null;
            }
            return obj[key] = def;
        },
        update: function(kwargs) {
            for (var k in kwargs) {
                obj[k] = kwargs[k];
            }
            return null;  // Always returns None
        }
    };
    OBJECT_MEMBERS.iteritems = OBJECT_MEMBERS.items;
    OBJECT_MEMBERS.itervalues = OBJECT_MEMBERS.values;
    OBJECT_MEMBERS.iterkeys = OBJECT_MEMBERS.keys;
    runtime.memberLookup = function(obj, val, autoescape) {
        obj = obj || {};

        // If the object is an object, return any of the methods that Python would
        // otherwise provide.
        if (lib.isArray(obj) && ARRAY_MEMBERS.hasOwnProperty(val)) {
            return ARRAY_MEMBERS[val];
        }

        if (lib.isObject(obj) && OBJECT_MEMBERS.hasOwnProperty(val)) {
            return OBJECT_MEMBERS[val];
        }

        return orig_memberLookup.apply(this, arguments);
    };

});
