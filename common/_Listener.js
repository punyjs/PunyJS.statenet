/**
* The listener is an API that exposes part of the listeners manager, which can be used, externaly from the TruJS.statenet namespace, to add or remove listeners to the statenet that uses the listener.
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
            , "value": function $listen(namespace, handlers) {
                return listenerManager
                    .$addListener(
                        namespace
                        , handlers
                    );
            }
        }
        , "$nolisten": {
            "enumerable": true
            , "value": function $nolisten(uuids) {
                return listenerManager
                    .$removeListener(
                        uuids
                    );
            }
        }
        , "$listening": {
            "enumerable": true
            , "value": function $listening(namespace) {
                return listenerManager
                    .$hasListener(
                        namespace
                    );
            }
        }
    });
}