 /**
* The state manager controls access to the state data. It monitors reads and writes, enforces accessibility and mutability rules, and executes change handlers for any listers.
* The worker function is a singleton that initializes the state once. Any subsequent calls will only return the initialized state.
* The object returned by the worker function is the root state proxy. The proxy is created using the initial state, if provided, and is configured using any instruction properties on the initial state object.
* The state manager factory can be executed 1..n times to create 1..n independent state proxies. This provide the ability to use several independent state controls in a single application.
* Properties on the root state that are objects will be treated as branches of the root state, inheriting instructions, as well as having the option to define their own instructions.




* @factory
*   @dependency {object} promise The global promise built-in
*   @dependency {function} utils_uuid
*   @dependency {function} utils_copy
*   @dependency {function} utils_update
*   @dependency {function} is_object
*   @dependency {function} is_objectValue
*   @dependency {object} defaults
*   @dependency {object} errors
* @feature state_instructions
*   @rule {boolean} [__nolisten] When set to true, change listeners will not be fired for any property on this object or it's descendants (superseded only by state instuctions on the descendant).
*   @rule {boolean} [__mutibility] Sets the object's mutibility, freeze, seal, noextend and open; default is freeze.
*   @rule {boolean|object} [__shared] If set to true, or an object, the proxy object's properties are shared with its ... ???. If the `__shared` value is an object, that object will be used to further define how the properties are shared.
*   @rule {string} [__access] Sets access permissions
*   @rule {boolean} [__async] If true, the change listeners will be fired asyncronously.
*   @rule {boolean} [__concurrent] If true, the change listeners will be ran concurrently (__async is forced to true)
*   @rule {boolean} [__noref] If true, the external reference to the object value will be removed using a deep copy; will not work with circular referenced object or functions.
*   @rule {object} [__descriptors] An object with 1..n property descriptors which will be applied to the object's properties.
*   @rule {string} [__uuid] The existing uuid of the object, if omitted one is generated.
* @interface iStateEntry
*   @property {object} target The target object value; object, function, array.
*   @property {object} meta An object with the state object's meta data.
*   @property {number} last A local timestamp used to identify the staleness of the state object.
*   @property {string} parent The uuid of the parent object.
*/
function _StateManager(
    promise
    , performance
    , statenet_common_listenerManager
    , statenet_common_listener
    , utils_uuid
    , utils_copy
    , utils_update
    , utils_applyIf
    , utils_apply
    , utils_getType
    , weakMap
    , is_object
    , is_objectValue
    , is_func
    , is_array
    , reporter
    , defaults
    , constants
    , info
    , errors
) {
    /**
    * The internal storage for state items and configurations
    * @property
    *   @private
    */
    var mem_store
    , root
    /**
    * @alias
    */
    , listenerManager = statenet_common_listenerManager
    /**
    * @alias
    */
    , listener = statenet_common_listener
    /**
    * A weak map to store meta data about each target object
    * @property
    */
    , metaMap = new weakMap()
    /**
    * The state manager's configuration
    * @property
    */
    , configuration
    ;

    return StateManager;

    /**
    * @worker
    *   @async
    *   @property {object} config An object with the state manager configuration
    *   @property {object} [rootState] An optional object used to initialize the state manager.
    */
    function StateManager(
        config
        , rootTarget
    ) {
        //initialize the state manager
        var meta = initialize(
            config
            , rootTarget
        );
        //create the root state proxy
        return createProxy(
            configuration.namespace || "$"
            , rootTarget
            , meta
        );
    };

    /**
    * sets up the external storage and intakes the initial state if provided
    * @function
    */
    function initialize(config, target = {}) {
        //if the configuration has been setup then skip this
        if (is_object(configuration)) {
            return;
        }
        //ensure we have a configuration, removing external references
        configuration = is_object(config)
            ? utils_copy(
                config
            )
            : {}
        ;
        //add the defaults for any missing configuration
        configuration = utils_update(
            configuration
            , utils_copy(
                defaults.statenet.stateManager.config
            )
        );

        var meta = {};
        //apply any instructions on the root meta object
        if (configuration.hasOwnProperty("instructions")) {
            utils_apply(
                config.instructions
                , meta
            );
            delete configuration.instructions;
        }
        //apply the defaults to the meta
        utils_applyIf(
            utils_copy(
                defaults.statenet.stateManager.instructions
            )
           , meta
       );

        //if we're using paging then setup the external storage
        if (configuration.paging === true) {
            setupExternalStorage(

            );
        }

        return meta;
    }
    /**
    * Initializes the offline storage that will be used to page state branches
    * @function
    */
    function setupExternalStorage() {
        //TODO: setup offline storage
        throw new Error(
            `${errors.statenet.statenet.not_implemented} (_StateManager.StateManager.setupExternalStorage)`
        );
    }

    /**
    * @function
    */
    function createProxy(name, target, parentMeta) {
        var meta = metaMap.get(target)
        , proxy
        ;
        //if there is no meta data then this must be our first encounter
        if (!meta) {
            meta = intakeTarget(
                name
                , target
                , parentMeta
            );
        }
        //see if we are going to watch
        if (meta.__nowatch === true) {
            return target;
        }
        //create a revokable proxy if marked
        if (meta.__revokable === true) {
            return Proxy.revocable(
                target
                , createTrapHandlers(
                    meta
                )
            );
        }
        //otherwise create a normal proxy
        else {
            return new Proxy(
                target
                , createTrapHandlers(
                    meta
                )
            );
        }
    }
    /**
    * @function
    */
    function intakeTarget(name, target, parentMeta) {
        //get the meta data
        var meta = extractMeta(
            name
            , target
            , parentMeta
        )
        , targetCopy
        ;
        metaMap.set(target, meta);
        if (is_func(target)) {
            return meta;
        }
        //see if we are removing the reference from the external target
        if (meta.__noref === true) {
            targetCopy = utils_copy(
                target
            );
            //create the internal object, preserving the prototype
            target = Object.create(
                Object.getPrototypeOf(target)
            );
            //apply a deep copy of the object value's properties.
            utils_apply(
                targetCopy
                , target
            );
        }
        //add any descriptors from the meta
        if (is_object(meta.__descriptors)) {
            ///INPUT VALIDATION
            ///TODO: check to see if the descriptors are properly formatted
            ///END INPUT VALIDATION
            Object.defineProperties(
                target
                , target.__descriptors
            );
        }
        //process the target propertes
        Object.keys(target)
        .forEach(
            function forEachKey(key) {
                var value = target[key];
                //prototype properties should not be trapped
                if (!target.hasOwnProperty(key)) {
                    return;
                }
                if (is_objectValue(value) || is_func(value)) {
                    intakeTarget(
                        key
                        , value
                        , meta
                    );
                }
            }
        );

        return meta;
    }
    /**
    * @function
    */
    function extractMeta(name, target, parentMeta) {
        var meta;
        //if the target is an array, and the first member is an object, with instruction properties, then that is the meta
        if (is_array(target) && is_object(target[0])) {
            meta = extractArrayMeta(
                name
                , target
            );
        }
        //if the target is an object then find any properties that map to instructions
        else {
            meta = extraObjectMeta(
                name
                , target
            );
        }
        //set the naming
        meta.__name = name;
        meta.__namespace = !!parentMeta && !!parentMeta.__namespace
            ? `${parentMeta.__namespace}.${name}`
            : name
        ;
        //set the initial timestamp
        meta.__last = performance.now();
        //apply the parentMeta for any missing
        utils_applyIf(
            parentMeta
            , meta
        );

        return meta;
    }
    /**
    * @function
    */
    function extraObjectMeta(name, target) {
        var meta = {};

        Object.keys(target)
        .forEach(
            function checkEachKey(key) {
                if (isInstruction(key)) {
                    meta = target[key];
                    delete target[key];
                }
            }
        );

        return meta;
    }
    /**
    * @function
    */
    function extractArrayMeta(name, target) {
        var isMeta =
            Object.keys(target[0])
            .every(
                function everyPropIsInstruction(key) {
                    return isInstruction(key);
                }
            )
        ;
        if (isMeta) {
            return target.shift();
        }
        else {
            return {};
        }
    }

    /**
    * @function
    */
    function createTrapHandlers(meta) {
        return {
            "get": stateManagerGetTrap.bind(null, meta)
            , "set": stateManagerSetTrap.bind(null, meta)
            , "deleteProperty": stateManagerDeleteTrap.bind(null, meta)
            , "apply": stateManagerApplyTrap.bind(null, meta)
            , "has": stateManagerHasTrap.bind(null, meta)
            , "ownKeys": stateManagerOwnKeysTrap.bind(null, meta)
        };
    }
    /**
    * @function
    */
    function stateManagerGetTrap(meta, target, propName) {
        //the state doesn't use symbols, passthrough
        if (typeof propName === "symbol") {
            return target[propName];
        }
        //a special property, isStateful
        if (propName === "isStateful") {
            return true;
        }
        //verify access
        hasAccess(
            meta
            , "get"
            , propName
        );
        //if this is an instruction then process it
        if (isInstruction(propName)) {
            return instructionHandler(
                meta
                , "get"
                , propName
            );
        }
        //if this is a listener then process it
        if (listenerManager.hasOwnProperty(propName)) {
            return listenerMethodHandler(
                meta
                , "get"
                , propName
            );
        }
        //prototype properties should not be trapped
        if (!target.hasOwnProperty(propName)) {
            return target[propName];
        }

        var hasProp = target.hasOwnProperty(propName)
        , namespace = !!meta.__namespace
            ? `${meta.__namespace}.${propName}`
            : propName
        , returnValue = target[propName]
        ;
        //intake and create a proxy for new objects
        if (is_objectValue(returnValue) || is_func(returnValue)) {
            returnValue = createProxy(
                propName
                , returnValue
                , meta
            );
        }
        //fire any listeners
        listenerManager.$fireListener(
            namespace
            , "get"
            , {
                "namespace": namespace
                , "trap": "get"
                , "miss": !hasProp
                , "value": returnValue
            }
        );
        ///LOGGING
        reporter.state(
            `${info.trap_handler_fired} get ${propName}`
        );
        ///END LOGGING

        return returnValue;
    }
    /**
    * @function
    */
    function stateManagerSetTrap(meta, target, propName, value) {
        //the state doesn't use symbols, passthrough
        if (typeof propName === "symbol") {
            target[propName] = value;
            return true;
        }
        //verify access
        hasAccess(
            meta
            , "apply"
            , propName
        );
        //if this is an instruction then process it
        if (isInstruction(propName)) {
            return instructionHandler(
                meta
                , "set"
                , propName
                , value
            );
        }
        //if this is a listener then process it
        if (listenerManager.hasOwnProperty(propName)) {
            return listenerMethodHandler(
                meta
                , "set"
                , propName
            );
        }

        var hasProp = target.hasOwnProperty(propName)
        , namespace = !!meta.__namespace
            ? `${meta.__namespace}.${propName}`
            : propName
        , oldValue = target[propName]
        , result = target[propName] = value
        , typeChange = false
        ;
        //see if we changed the type
        if (!!hasProp && utils_getType(oldValue) !== utils_getType(value)) {
            typeChange = true;
        }
        //fire any listeners
        listenerManager.$fireListener(
            namespace
            , "set"
            , {
                "namespace": namespace
                , "trap": "set"
                , "miss": !hasProp
                , "typeChange": typeChange
                , "oldValue": oldValue
                , "success": !!result
            }
        );
        ///LOGGING
        reporter.state(
            `${info.trap_handler_fired} set ${propName}`
        );
        ///END LOGGING

        return true;
    }
    /**
    * @function
    */
    function stateManagerDeleteTrap(meta, target, propName) {
        //the state doesn't use symbols, passthrough
        if (typeof propName === "symbol") {
            return delete target[propName];
        }
        //verify access
        hasAccess(
            meta
            , "apply"
            , propName
        );
        //if this is an instruction then process it
        if (isInstruction(propName)) {
            return instructionHandler(
                meta
                , "delete"
                , propName
                , value
            );
        }
        //if this is a listener then process it
        if (listenerManager.hasOwnProperty(propName)) {
            return listenerMethodHandler(
                meta
                , "delete"
                , propName
            );
        }

        var hasProp = target.hasOwnProperty(propName)
        , namespace = !!meta.__namespace
            ? `${meta.__namespace}.${propName}`
            : propName
        , result = delete target[propName]
        ;
        //fire any listeners
        listenerManager.$fireListener(
            namespace
            , "delete"
            , {
                "namespace": namespace
                , "trap": "delete"
                , "miss": !hasProp
                , "success": result
            }
        );
        ///LOGGING
        reporter.state(
            `${info.trap_handler_fired} delete ${propName}`
        );
        ///END LOGGING

        return result;
    }
    /**
    * @function
    */
    function stateManagerApplyTrap(meta, target, thisArg, argList) {
        //verify access
        hasAccess(
            meta
            , "apply"
        );
        //run the function and store the result
        var result = target
            .apply(
                thisArg
                , argList
            )
        ;
        //fire any listeners
        listenerManager.$fireListener(
            meta.__namespace
            , "apply"
            , {
                "namespace": meta.__namespace
                , "trap": "apply"
                , "scope": thisArg
                , "arguments": argList
            }
        );
        ///LOGGING
        reporter.state(
            `${info.trap_handler_fired} apply ${meta.__namespace}`
        );
        ///END LOGGING

        return result;
    }
    /**
    * @function
    */
    function stateManagerHasTrap(meta, target, propName) {
        if (typeof propName !== "symbol") {
            if (listenerManager.hasOwnProperty(propName)) {
                return true;
            }
        }
        return propName in target;
    }
    /**
    * @function
    */
    function stateManagerOwnKeysTrap(meta, target) {
        var keys = Object.getOwnPropertyNames(target)
        , symbolKeys = Object.getOwnPropertySymbols(target)
        , listenerKeys = Object.keys(listenerManager)
        ;
        //filter out internal instructions
        keys = keys.filter(
            function filterKeys(key) {
                if (constants.internalOnly.indexOf(key) === -1) {
                    return true;
                }
                return false;
            }
        );
        //combine the keys
        keys = keys.concat(symbolKeys);
        for(let i = 0, l = listenerKeys.length; i < l; i++) {
            if (keys.indexOf(listenerKeys[i]) === -1) {
                keys.push(listenerKeys[i]);
            }
        }

        return keys;
    }

    /**
    * Checks to see if the caller has permissions to access this property
    * @function
    */
    function hasAccess(meta, trapName, propName) {
        var hasAccess = true;
        ///TODO: add permissions code
        if(!hasAccess) {
            throw new Error(
                `${errors.statenet.unauthorized_access} (${action} ${propName})`
            );
        }
    }
    /**
    * @function
    */
    function instructionHandler(meta, action, propName, value) {
        ///LOGGING
        reporter.state(
            `${info.instruction_handler_fired} ${action} ${propName}`
        );
        ///END LOGGING
        //if this is internal
        if (constants.internalOnly.indexOf(propName) !== -1) {
            throw new Error(
                `${errors.statenet.access_instruction_failed_internalonly} (${propName})`
            );
        }
        else if (action === "get") {
            //local instruction property
            if (meta.hasOwnProperty(propName)) {
                return meta[propName];
            }
            else {
                return;
            }
        }
        else if (action === "set") {
            if (constants.readOnly.indexOf(propName) !== -1) {
                throw new Error(
                    `${errors.set_instruction_failed_readonly} (${propName})`
                );
            }
            meta[instruction] = value;
        }
        throw new Error(
            `${errors.statenet.invalid_op_instruction} (${propName} ${action})`
        );
    }
    /**
    * @function
    */
    function listenerMethodHandler(meta, trapName, propName) {
        if (trapName === "get") {
            //wrap the listener methods to insert the meta namspace on the namespace passed to the handler
            if (
                propName === "$addListener"
                || propName === "$hasListener"
                || propName === "$fireListener"
            ) {
                return function wrappedListenerMethod(...args) {
                    args[0] = `${meta.__namespace}.${args[0]}`;
                    return listenerManager[propName].apply(null, args);
                };
            }
            else if (propName === "$removeListener") {
                return listenerManager[propName];
            }
        }
        throw new Error(
            `${errors.statenet.illegal_listener_operation} (${trapName} ${propName})`
        );
    }
    /**
    * @function
    */
    function isInstruction(propName) {
        if (typeof propName === "symbol") {
            return false;
        }
        if (!propName.indexOf) {
            debugger;
        }
        if (
            propName.indexOf("__") === 0
            && constants.instructions.indexOf(propName) !== -1
        ) {
            return true;
        }
        return false;
    }
}