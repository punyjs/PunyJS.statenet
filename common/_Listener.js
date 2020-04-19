/**
* The listener is an API that exposes part of the listers manager, which can be used, externaly from the TruJS.state namespace, to add or remove listeners to the statenet that uses the listener.
* @factory
*/
function _Listener (
    state_common_listenerManager
    , is_uuid
    , is_array
    , is_string
) {
    /**
    * @alias
    */
    var listenerManager = state_common_listenerManager
    ;

    /**
    * @worker
    */
    return Object.create(Object, {
        "$listen": {
            "enumerable": true
            , "value": function $listen(...args) {
                var parsed = parseArgs(args);
                return listenerManager
                    .addListener(
                        parsed[0] //namespace
                        , parsed[1] //handlers
                    );
            }
        }
        , "$nolisten": {
            "enumerable": true
            , "value": function $nolisten(...args) {
                var parsed = parseArgs(args);
                return listenerManager
                    .removeListener(
                        parsed[0] //namespace
                        , parsed[1] //uuids
                    );
            }
        }
        , "$listening": {
            "enumerable": true
            , "value": function $listening(...args) {
                var parsed = parseArgs(args);
                return listenerManager
                    .hasListener(
                        parsed[0] //namespace
                    );
            }
        }
    });
    /**
    * @function
    */
    function parseArgs(args) {
        var namespace, handlers;
        if (args.length === 2) {
            namespace = args[0];
            handlers = args[1];
        }
        else {
            //if an array was sent, combine each member with the base namespace
            if (is_array(args[1])) {
                namespace = [];
                for(let i = 0, l = args[1].length; i < l; i++) {
                    if (is_string(args[1][i])) {
                        namespace.push(
                            `${args[0]}.${args[1][i]}`
                        );
                    }
                    else {
                        namespace.push(
                            args[0]
                        );
                    }
                }
            }
            else {
                namespace = `${args[0]}.${args[1]}`;
            }
            handlers = args[2];
        }

        return [
            namespace
            , handlers
        ];
    }
}