/**
* The gatekeeper handles the syncronization of state data between the local and external endpoints.
1. It handles external listener registration
2. It handles external state change messages, updating the local state manager
3. It handles local state changes for external listeners, relaying the change
4. It handles encryption / decryption of the external message data
* @factory
*   @singleton
*/
function _Gatekeeper(
    endpoint_listenerManager
    , endpoint_externalConnection
    , endpoint_stateManager
) {


    /**
    * @worker
    */
    return function Gatekeeper (

    ) {


    };
}