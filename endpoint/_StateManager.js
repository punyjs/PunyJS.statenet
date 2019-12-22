/**
* The state manager controls access to the state data. It monitors reads and writes, enforces accessibility and mutability rules, and executes change handlers for any listers; internal and external.
* The worker returned by the factory is the root state proxy. Each proxy is created using the initial state, if provideed, and is configured with instruction properties on the initial state object.
* The state manager factory can be executed 1..n times to create 1..n independent state proxies. This provide the ability to use several independent state controls in a single application.
* Properties on the root state that are objects will be treated as branches of the root state, inheriting instructions, as well as having the option to define their own instructions.
* State instructions are used to configure the object in which they reside. The state manager processes the instructions when an object is added to the state.
* @feature state_instructions
*   @rule {boolean} [__nolisten] When set to true, change listeners will not be fired for any property on this object or it's descendants (superseded only by state instuctions on the descendant).
*   @rule {boolean} [__freeze] When set to true, the object is frozen using  `Object.freeze()`.
*   @rule {boolean} [__seal] When set to true, the object is sealed using `Object.seal()`.
*   @rule {boolean} [__noextend] When set to true, the object cannot be extended, using `Object.preventExtensions()`.
*   @rule {boolean|object} [__shared] If set to true, or an object, the proxy object's properties are shared with its siblings. If the `__shared` value is an object, that object will be used to further define how the properties are shared.
*   @rule {boolean} [__async] If true, the change listeners will be fired asyncronously.
*   @rule {boolean} [__concurrent] If true, the change listeners will be ran concurrently.
*   @rule {object} [__descriptors] An object with 1..n property descriptors which will be applied to the object's properties.
* @factory
*/
function _StateManager (
    endpoint_listenerManager
    , endpoint_listenerPrototype
    , initialState
    , utils_uuid
) {



    /**
    * @worker
    */



}