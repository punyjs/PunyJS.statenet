/**
* The endpoint represents one end of a `state.net`. It initializes the state manager and gatekeeper.
* The worker function returned by the factory takes an object, the configuration, which is used to configure the endpoint.
* @factory
*   @singleton
*/
function _Endpoint (
    promise
    , state_common_stateManager
    , state_endpoint_gatekeeper
    , is_object
    , defaults
) {
    /**
    * @alias
    */
    var stateManager = state_common_stateManager
    /**
    * @alias
    */
    , gatekeeper = state_endpoint_gatekeeper
    ;

    /**
    * @worker
    *   @param {object} config An object with the endpoint configuration
    *   @param {object} [initialState] An optional object used in to initialize the state object, otherwise and empty object is used.
    *   @returns
    */
    return function Endpoint (
        config
        , initialState
    ) {
        var stateProxy
        //run the state manager to get the state proxy
        , proc = stateManager(
            config
            , initialState
        );
        //then store the state proxy to a var in the worker scope
        proc = proc.then(function thenStoreStateProxy(proxy) {
            stateProxy = proxy;
            return promise.resolve();
        });
        //if we are configured to use a gatekeeper
        if (!!config.enableGatekeeper) {
            //connect the gatekeeper
            proc = proc.then(function thenConnectGatekeeper() {
                return gatekeeper(
                    config
                    , updateHandler.bind(null, stateProxy)
                );
            });
        }
        //resolve with the state proxy
        return proc.then(function thenResolveProxy() {
            return promise.resolve(stateProxy);
        });
    };

    /**
    * Handles state updates from the gatekeeper
    * @function
    */
    function updateHandler(stateProxy, updateColl) {

    }
}