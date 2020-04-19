/**
* The state manager controls access to the state data. It monitors reads and writes, enforces accessibility and mutability rules, and executes change handlers for any listers.
* The worker function is a singleton that initializes the state once. Any subsequent calls will only return the initialized state.
* The object returned by the worker function is the root state proxy. The proxy is created using the initial state, if provided, and is configured using any instruction properties on the initial state object.
* The state manager factory can be executed 1..n times to create 1..n independent state proxies. This provide the ability to use several independent state controls in a single application.
* Properties on the root state that are objects will be treated as branches of the root state, inheriting instructions, as well as having the option to define their own instructions.
* State instructions are used to configure the object in which they reside. The state manager processes the instructions when an object is added to the state.
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
    , state_common_listenerManager
    , state_common_listener
    , utils_uuid
    , utils_copy
    , utils_update
    , utils_applyIf
    , utils_apply
    , utils_getType
    , is_object
    , is_objectValue
    , is_uuid
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
    , listenerManager = state_common_listenerManager
    /**
    * @alias
    */
    , listener = state_common_listener
    ;

    /**
    * @worker
    *   @async
    *   @property {object} config An object with the state manager configuration
    *   @property {object} [rootState] An optional object used to initialize the state manager.
    */
    return function StateManager(
        config
        , rootState
    ) {
        try {
            //initialize the state manager
            initialize(
                config
                , rootState
            );
            //create the root state proxy
            var proxy = createProxy(
                root
            );

            return promise.resolve(proxy);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };

    /**
    * sets up the external storage and intakes the initial state if provided
    * @function
    */
    function initialize(config, rootState = {}) {
        //if the mem store has been setup then skip this
        if (is_object(root)) {
            return;
        }
        //ensure we have a configuration, removing external references
        config = is_object(config)
            ? utils_copy(
                config
            )
            : {}
        ;
        //add the defaults for any missing configuration
        config = utils_update(
            config
            , utils_copy(
                defaults.statenet.stateManager.config
            )
        );
        //add the config
        rootState.__config = config;
        //Intake the rootState
        root = intakeObject(
            config.namespace || ""
            , rootState
        );
        //apply any instructions on the config object
        if (config.hasOwnProperty("instructions")) {
            ///INPUT VALIDATION
            validateInstructions(
                config.instructions
            );
            ///END INPUT VALIDATION
            utils_applyIf(
                config.instructions
                , root
            );
        }
        //add missing instructions with defaults
        utils_applyIf(
            defaults.statenet.stateManager.instructions
            , root
        );

        //if we're using paging then setup the external storage
        if (root.__config.paging === true) {
            setupExternalStorage(

            );
        }
    }
    /**
    * Initializes the offline storage that will be used to page state branches
    * @function
    */
    function setupExternalStorage() {
        //TODO: setup offline storage
        throw new Error(
            `${errors.not_implemented} (_StateManager.StateManager.setupExternalStorage)`
        );
    }

    /**
    * Adds an object value to the catalog and returns a proxy object
    * @function
    */
    function intakeObject(propName, objectValue, parent) {
        ///INPUT VALIDATION
        ///END INPUT VALIDATION
        var targetObject = createTargetObject(
            propName
            , objectValue
            , parent
        );

        //add the new state object to the store
        if (!!parent) {
            parent[propName] = targetObject;
        }

        return targetObject;
    }
    /**
    * Uses the instructions in the meta data to create property descriptors and then creates the target object using those descriptors. The objectValue may be copied to remove references, at which point the property descriptors will point to the copied object.
    * @function
    */
    function createTargetObject(propName, objectValue, parent) {
        var namespace = propName
        , target = objectValue
        , noref = target.hasOwnProperty("__noref")
            ? !!target.__noref
            : true
        ;
        //if we don't want to preserve the external object reference
        if (noref === true) {
            //create the internal object, preserving the prototype
            target = Object.create(
                Object.getPrototypeOf(objectValue)
            );
            //apply a deep copy of the object value's properties.
            utils_apply(
                utils_copy(objectValue)
                , target
            );
        }
        //add the parent uuid and namespace
        if (!!parent) {
            target.__parent = parent;
            namespace = `${parent.__namespace}.${propName}`;
        }
        target.__name = propName;
        target.__namespace = namespace;
        target.__last = Date.now();
        //update the property descriptors
        Object.keys(target)
        .forEach(function processEachProperty(key) {
            //if this is an instruction, convert any to readonly
            if (isInstruction(key)) {
                var descriptor = {
                    "enumerable": true
                    , "value": target[key]
                };
                ///TODO: add logic to add to the descriptor based on the type of instruction it is, should we allow writing, or is it read only
                if (constants.readOnly.indexOf(key) === -1) {
                    descriptor.writable = true;
                }
                //define/re-define property
                Object.defineProperty(
                    target
                    , key
                    , descriptor
                );
            }
            //intake any objects
            else {
                if (is_objectValue(target[key])) {
                    intakeObject(
                        key
                        , target[key]
                        , target
                    );
                }
            }
        });
        //add any descriptors from the meta
        if (is_object(target.__descriptors)) {
            ///INPUT VALIDATION
            ///TODO: check to see if the descriptors are properly formatted
            ///END INPUT VALIDATION
            Object.defineProperties(
                target
                , target.__descriptors
            );
        }

        return target;
    }
    /**
    * Removes an object from the mem store
    * @function
    */
    function removeObject(target) {
        if (!!target.__parent) {
            delete target.__parent[target.__name];
        }
        //loop through the entry's properties, removing any objects recursively
        for(var propKey in Object.keys(target)) {
            if (is_objectValue(target[propKey])) {
                removeObject(
                    target[propKey]
                );
            }
        }
    }
    /**
    * Creates a proxy object for the uuid
    * @function
    */
    function createProxy(target) {
        if (target.__proxy) {
            return target.__proxy;
        }

        if (target.__nowatch === true) {
            target.__proxy = new Proxy(
                target
                , {}
            );
        }
        else if (target.__revokable) {
            //if we haven't created the revokable yet
            if (target.__revokable === true) {
                target.__revokable = Proxy.revocable(
                    target
                    , getTrapHandlers(
                        target
                    )
                );
            }
            //get the revokable proxy
            target.__proxy = target.__revokable.proxy;
        }
        else {
            target.__proxy = new Proxy(
                target
                , getTrapHandlers(
                    target
                )
            );
        }

        return target.__proxy;
    }
    /**
    * @function
    */
    function revokeProxy(target) {
        if (!!target.__revokable) {
            target.__revokable.revoke();
            delete target.__proxy;
            delete target.__revokable;
        }
    }
    /**
    * @function
    */
    function getTrapHandlers(target) {
        var traps = {};
        //add the standard traps
        for(let i = 0, l = constants.traps.length; i < l; i++) {
            var trapName = constants.traps[i];
            traps[trapName] =
                processTrap.bind(null, trapName);
        }
        //add meta traps
        ///TODO: add conditional statement for meta traps

        //add function traps
        ///TODO: add conditional statement for function traps

        return traps;
    }
    /**
    * @function
    */
    function processTrap(trapName, target, propName, ...args) {
        propName = propName || "";
        trapName = trapName
            .replace("Property", "")
            .replace("Descriptor", "")
        ;
        //see if this is a miss
        var action = !!propName && !target.hasOwnProperty(propName)
            ? `miss_${trapName}`
            : trapName
        , value = trapName === "set"
            ? args[0]
            : undefined
        //see if this is an instruction, or listener method
        , processed = preprocessTrap(
            target
            , trapName
            , action
            , propName
            , value
        );
        //!undefined means that we've already processed the trap
        if (processed !== undefined) {
            //work around
            if (processed === "undef") {
                return;
            }
            return processed;
        }
        //run the trap handler for this trap name
        return handleTrap(
            target
            , action
            , propName
            , value
        );
    }
    /**
    * @function
    */
    function preprocessTrap(target, trapName, action, propName, value) {
        //check access and mutability, throwing an error if violated
        hasAccess(
            target
            , action
            , propName
        );
        //if the property name is `then` we'll assume async duck typing
        if (propName === "then") {
            return thenPropertyHandler(
                target
                , trapName
                , propName
            );
        }
        //if this is an instruction, then process independently
        if (isInstruction(propName)) {
            return instructionHandler(
                target
                , trapName
                , propName
                , value
            );
        }
        //see if it's a listener method
        if (listener.hasOwnProperty(propName)) {
            return listenerMethodHandler(
                target
                , trapName
                , propName
            );
        }
        ///LOGGING
        reporter.state(
            `${info.trap_handler_fired} ${action} ${propName}`
        );
        ///END LOGGING
    }
    /**
    * Creates the handler token and concatinates is with the function call arguments.
    * @function
    */
    function handleTrap(target, action, propName, newValue) {
        //get the current value
        var namespace = !!propName
            ? `${target.__namespace}.${propName}`
            : target.__namespace
        , value = target[propName]
        , returnValue
        , skipProxy = false
        ;
        //
        switch(action) {
            case "get":
                returnValue = target[propName];
                break;
            case "miss_get":
                //see if this is a prototype
                if (propName in target) {
                    return target[propName];
                }
                break;
            case "set":
                action = "change";
                //see if we changed the type
                if (utils_getType(newValue) !== utils_getType(value)) {
                    action = "type_change";
                }
                //remove the old object
                if (is_objectValue(value)) {
                    removeObject(
                        value
                    );
                }
                target[propName] = newValue;
                returnValue = true;
                break;
            case "miss_set":
                action = "new";
                target[propName] = newValue;
                returnValue = true;
                break;
            case "has":
                //handles the `in` operator
                returnValue = true;
                break;
            case "miss_has":
                returnValue = false;
                break;
            case "delete":
                removeObject(
                    value.__uuid
                );
                //remove listeners
                listenerManager.removeListener(
                    namespace
                );
                //remove the object from the target
                delete target[propName];
                break;
            case "getOwn":
                //handles Object.getOwnPropertyDescriptor() and {object}.hasOwnProperty()
                returnValue = Object.getOwnPropertyDescriptor(
                    target
                    , propName
                );
                skipProxy = true;
                break;
            case "miss_getOwn":
                returnValue = false;
                skipProxy = true;
                break;
            case "ownKeys":
                //handles Object.getOwnPropertyNames(), Object.getOwnPropertySymbols() and Object.keys()
                returnValue = Object.keys(target)
                    .filter(function filterKeys(key) {
                        if (isInstruction(key)) {
                            return constants
                                .internalOnly
                                .indexOf(propName) === -1
                            ;
                        }
                        return true;
                    });
                skipProxy = true;
                break;
        }
        //intake and create a proxy for new objects
        if (!skipProxy && is_objectValue(returnValue)) {
            if (action === "new") {
                returnValue = intakeObject(
                    propName
                    , returnValue
                    , target
                );
                target[propName] = returnValue;
            }
            returnValue = createProxy(
                returnValue
            );
        }
        //fire the listeners
        listenerManager.fireListener(
            namespace
            , action
            , returnValue
        );

        return returnValue;
    }
    /**
    * Checks to see if the caller has permissions to access this property
    * @function
    */
    function hasAccess(target, trapName, propName) {
        var hasAccess = true;
        ///TODO: add permissions code
        if(!hasAccess) {
            throw new Error(
                `${errors.unauthorized_access} (${action} ${propName})`
            );
        }
    }
    /**
    * @function
    */
    function instructionHandler(target, action, propName, value) {
        ///LOGGING
        reporter.state(
            `${info.instruction_handler_fired} ${action} ${propName}`
        );
        ///END LOGGING
        //if this is internal
        if (constants.internalOnly.indexOf(propName) !== -1) {
            if (action === "has") {
                return false;
            }
            else if (action === "set") {
                if (propName === "__revoke" && value == true) {
                    revokeProxy(
                        target
                    );
                    return true;
                }
            }
            else if (action === "getOwn") {
                return "undef";
            }
            throw new Error(
                `${errors.access_instruction_failed_internalonly} (${propName})`
            );
        }
        else if (action === "get") {
            //local instruction property
            if (target.hasOwnProperty(propName)) {
                return target[propName];
            }
            //otherwise lookup the property on the parent
            else if (!!target.parent) {
                return instructionHandler(
                    parent
                    , action
                    , propName
                );
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
            target[instruction] = value;
            if (propName === "__nowatch") {
                createProxy(
                    target
                );
            }
        }
        else if (action === "has") {
            return target.hasOwnProperty(propName);
        }
        else if (action === "getOwn") {
            return;
        }
        else if (action === "ownKeys") {
            Object.keys(target)
                .filter(function filterKeys(key) {
                    if (isInstruction(key)) {
                        return constants
                            .internalOnly
                            .indexOf(propName) === -1
                        ;
                    }
                    return false;
                });
        }
        throw new Error(
            `${errors.invalid_op_instruction} (${propName} ${action})`
        );
    }
    /**
    * @function
    */
    function listenerMethodHandler(target, trapName, propName) {
        if (trapName === "get") {
            return listener[propName].bind(null, target.__namespace);
        }
        throw new Error(
            `${errors.illegal_listener_operation} (${trapName} ${propName})`
        );
    }
    /**
    * @function
    */
    function thenPropertyHandler(token, trapName, propName) {
        ///TODO: figure out how to use the `then` and `catch` and `finally` promise methods
        return false;
    }
    /**
    * @function
    */
    function isInstruction(propName) {
        if(
            propName.indexOf("__") === 0
            && constants.instructions.indexOf(propName) !== -1
        ) {
            return true;
        }
        return false;
    }
    /**
    * @function
    */
    function validateInstructions(instructions) {
        if(!is_object(instructions)) {
            throw new Error(
                `${errors.invalid_instruction} (${instructions})`
            );
        }
        return Object.values(instructions)
        .every(function everyInstruction(instruction) {
            return isInstruction(
                instruction
            );
        });
    }
}