/**
* The listener manager houses a collection of listeners -- groups of event handling callback functions -- tied to namespaces, and provides an API for adding, removing and dispatching listeners.
* The handlers are stored in a tree that matches the namespace path structure. Each property in the tree represents an `iListenerNode`. Each `iListenerNode` holds any directly linked handlers, wildcard handlers created from `path_selectors` and any child nodes of the namespace.
* @factory
* @feature path_selector
*   @selector $every Selects every direct descendant of the listened to branch
*   @selector $all Selects all descendants recursively, must be the last segment of the namespace
* @interface iListenerNode
*   @property [object] children A collection of descendant `iListenerNode`
*   @property [object] wildcards A collection of wildcards (namespaces added with path selectors), indexed by the wildcard portion of the namespace
*   @property [object] handlers A collection of handler functions that are directly linked to the namespace of the node
*/
function _ListenerManager (
    is_nill
    , is_array
    , is_func
    , is_empty
    , is_object
    , is_uuid
    , utils_uuid
    , utils_arrayOfType
    , reporter
    , errors
) {
    /**
    * An object that holds the listener functions
    * @property
    *   @private
    */
    var listener_tree = {}
    /**
    * A collection of
    * @property
    *   @private
    */
    , uuidStoreMap = {}
    /**
    * @constants
    */
    , cnsts = {
        "selectors": {
            "$all": {
                "substitution": "(?:.+)$"
                , "lookup": /(?:^|[.])\$all$/
            }
            , "$every": {
                "substitution": "(?:[^.]+)"
                , "lookup": /(?:^|[.])\$every(?:[.]|$)/g
            }
        }
    }
    /**
    * A regular expression pattern for splitting namespaces
    * @property
    */
    , DOT_PATT = /[.]/g
    /**
    * A regular expression pattern for matching namespaces
    * @property
    */
    , NAMESPACE_PATT = /^(?:[A-z0-9_$]+(?:[.](?!$)|$))+$/
    ;

    /**
    * The listener manager API
    * @worker
    */
    return Object.create(Object, {
        "hasListener": {
            "enumerable": true
            , "value": hasListener
        }
        , "addListener": {
            "enumerable": true
            , "value": addListener
        }
        , "removeListener": {
            "enumerable": true
            , "value": removeListener
        }
        , "fireListener": {
            "enumerable": true
            , "value": fireListener
        }
    });

    /**
    * @function
    */
    function addListener(namespace, handlers, actions) {
        if(!is_array(handlers)) {
            handlers = [handlers];
        }
        if(is_array(namespace)) {
            return addListeners(
                namespace
                , handlers
            );
        }
        ///INPUT VALIDATION
        validateNamespace(
            namespace
        );
        if (utils_arrayOfType(handlers) !== "function") {
            throw new Error(
                `${errors.invalid_handler}`
            );
        }
        ///END INPUT VALIDATION
        //the namspace could have selectors in it
        var parsedNs = parseNamespace(
            namespace
        )
        //lookup the listener entry, creating the path if missing
        , listenerEntry = getListenerEntry(
            parsedNs.base
            , true
        )
        , uuids, wildcards
        ;
        //see if the namespace has a wildcard
        if(!is_nill(parsedNs.wildcard)) {
            //ensure we have a wildcards object
            if (!listenerEntry.hasOwnProperty("wildcard")) {
                listenerEntry.wildcards = {};
            }
            wildcards = listenerEntry.wildcards;
            //see if we already have a wildcard entry for this wildcard
            if (!wildcards.hasOwnProperty(parsedNs.wildcard)) {
                wildcards[parsedNs.wildcard] = {
                    "pattern": createRegExPattern(
                        parsedNs.base
                        , parsedNs.wildcard
                    )
                    , "handlers": {}
                };
            }
            //add the handlers to the collection
            uuids = addHandlers(
                namespace
                , wildcards[parsedNs.wildcard].handlers
                , handlers
                , actions
            );
        }
        //otherwise add the handlers to the direct handlers collection
        else {
            //add the handlers to the collection
            uuids = addHandlers(
                namespace
                , listenerEntry.handlers
                , handlers
                , actions
            );
        }

        //return the resulting uuids
        return uuids;
    }
    /**
    * Loops through the namespaces and add the handlers to each
    * @function
    */
    function addListeners(namespaces, handlers, actions) {
        var uuids = [];

        for(let i = 0, l = namespaces.length; i < l; i++) {
            uuids = uuids.concat(
                addListener(
                    namespaces[i]
                    , handlers
                    , actions
                )
            );
        }

        return uuids;
    }
    /**
    * @function
    */
    function hasListener(namespace) {
        ///INPUT VALIDATION
        validateNamespace(
            namespace
        );
        ///END INPUT VALIDATION
        //the namspace could have selectors in it, so parse
        var parsedNs = parseNamespace(
            namespace
        )
        //lookup the listener entry, creating the path if missing
        , listenerEntry = getListenerEntry(
            parsedNs.base
        );
        //return false if no listener entry was found
        if(!!listenerEntry) {
            //if this has a wildcard, see if it exists in the wildcards collection
            if(!!parsedNs.wildcard) {
                return listenerEntry.wildcards
                    .hasOwnProperty(parsedNs.wildcard);
            }
            //otherwise it's a direct lookup, see if there are handlers
            else if(!is_empty(listenerEntry.handlers)) {
                return true;
            }
        }
        //loop through the segments to see if there is a wildcard match in a parent branch
        var scope = listener_tree;
        for(let i = 0, l = parsedNs.segments.length - 1; i < l; i++) {
            let name = parsedNs.segments[i];
            //name doesn't exist, listener not found
            if(!scope.hasOwnProperty(name)) {
                return false;
            }
            //set the scope to the next branch
            scope = scope[name];
            //execute the callback function
            if (scope.hasOwnProperty("wildcards")) {
                for(let key in scope.wildcards) {
                    let wildcard = scope.wildcards[key];
                    if (wildcard.pattern.test(namespace)) {
                        return true;
                    }
                }
            }
            //move to the next branch if there are children
            if(!!scope.children) {
                scope = scope.children;
            }
            //otherwise listener not found
            else {
                return false;
            }
        }

        return false;
    }
    /**
    * @function
    */
    function removeListener(parentNamespace, uuids) {
        if(!is_array(uuids)) {
            uuids = [uuids];
        }
        ///INPUT VALIDATION
        validateNamespace(
            parentNamespace
        );
        validateUuids(
            uuids
        );
        ///END INPUT VALIDATION
        var handlers = {};

        //loop through the uuids
        uuids.forEach(function forEachUuid(uuid) {
            //the namspace could have selectors in it
            var namespace = uuidStoreMap[uuid]
            , parsedNs = !!namespace && parseNamespace(
                namespace
            )
            //lookup the listener entry, creating the path if missing
            , listenerEntry = !!parsedNs && getListenerEntry(
                parsedNs.base
            )
            , handler;
            if (!namespace) {
                return;
            }
            //if we didn't find a listener then exit
            if (!listenerEntry) {
                return;
            }
            //see if this is coming from the parent namespace, if not don't proceed
            if (namespace.indexOf(parentNamespace) === -1) {
                ///TODO: determine if we should throw an error since this is not coming from the parent
                return;
            }
            //remove the uuid from the direct handlers if no wild card
            if (is_nill(parsedNs.wildcard)) {
                handler = listenerEntry
                    .handlers[uuid];
                delete listenerEntry
                    .handlers[uuid];
            }
            else {
                handler = listenerEntry
                    .wildcards[parsedNs.wildcard]
                    .handlers[uuid];
                delete listenerEntry
                    .wildcards[parsedNs.wildcard]
                    .handlers[uuid];
            }
            //remove the map entry
            delete uuidStoreMap[uuid];
            //add the handler to the handlers collection
            if (!is_nill(handler)) {
                if(!handlers) {
                    handlers = {};
                }
                handlers[uuid] = handler;
            }
        });

        return handlers;
    }
    /**
    * @function
    */
    function fireListener(namespace, action, value) {
        ///INPUT VALIDATION
        validateNamespace(
            namespace
        );
        ///END INPUT VALIDATION
        //get all of the handlers for this namespace
        getHandlers(
            namespace
        )
        //fire the handlers
        .forEach(function forEachHandler(handler) {
            try {
                var actions = handler.actions
                , func = handler.func
                ;
                if (
                    actions.indexOf(action) !== -1
                    || actions.indexOf("all") !== -1
                ) {
                    func(
                        value
                        , namespace
                        , action
                    );
                }
            }
            catch(ex) {
                reporter.error(ex);
            }
        });
    }
    /**
    * @function
    */
    function parseNamespace(namespace) {
        var segments = namespace.split(".")
        , segment
        , selectors = Object.keys(cnsts.selectors)
        , baseNs = []
        , wildcardNs
        ;

        for(let i = 0, l = segments.length; i < l; i++) {
            segment = segments[i];
            //if we haven't started the wildcard yet, process
            if(!wildcardNs) {
                if (selectors.indexOf(segment) === -1) {
                    baseNs.push(segment);
                }
                else {
                    wildcardNs = [segment];
                }
            }
            else {
                wildcardNs.push(segment);
            }
        }

        return {
            "segments": segments
            , "base": baseNs
            , "wildcard": !!wildcardNs
                ? wildcardNs.join(".")
                : null
        };
    }
    /**
    * @function
    */
    function getListenerEntry(nsSegs, create) {
        var scope = listener_tree;
        //loop through the namespace segments, crawling up the tree until the last segment has been found
        for(let i = 0, l = nsSegs.length, last = l - 1; i < l; i++) {
            let name = nsSegs[i]
            , node
            , isLast = i === last
            ;
            //if we didn't find the next node
            if (!scope.hasOwnProperty(name)) {
                //if we are creating missing paths
                if (create === true) {
                    node = {
                        "handlers": {}
                    };
                    if (!isLast) {
                        //this is a branch, so include the children collection
                        node.children = {};
                    }
                    scope[name] = node;
                }
                //no node and we aren't creating, return undefined for not found
                else {
                    return;
                }
            }
            //set the node to the property at name
            node = scope[name];
            //if this is not an object and this is not the last segment, return undefined for not found
            if(!is_object(node) && !isLast) {
                return;
            }
            //if this is not the last segment, set node to its children collection
            if (!isLast) {
                //safeguard in case we have an entry that doesn't have children
                if (!node.hasOwnProperty("children")) {
                    node.children = {};
                }
                node = node.children;
            }
            //update the scope for recursion
            scope = node;
        }
        //return the final scope
        return scope;
    }
    /**
    * @function
    */
    function addHandlers(namespace, store, handlers, actions) {
        var uuids = [];

        if (is_nill(actions)) {
            actions = ["all"];
        }
        if (!is_array(actions)) {
            actions = [actions];
        }

        for(let i = 0, l = handlers.length, uuid; i < l; i++) {
            uuid = utils_uuid({
                "version": 4
            });
            store[uuid] = {
                "func": handlers[i]
                , "actions": actions
            };
            uuidStoreMap[uuid] = namespace;
            uuids.push(uuid);
        }

        return uuids;
    }
    /**
    * @function
    */
    function createRegExPattern(base, wildcard) {
        //the begining is the base namespace with the dots converted for regex
        var pattern = base.join("[.]");
        //update the dots in the wildcard
        wildcard = wildcard.replace(DOT_PATT, "[.]");
        //loop through the selectors and replace instances of each with their pattern
        Object.keys(cnsts.selectors)
        .forEach(function forEachSelector(selector) {
            var patt = cnsts.selectors[selector]
            , lookup = patt.lookup
            , substitution = patt.substitution;
            wildcard = wildcard.replace(lookup, substitution);
        });
        //add the newly updated wildcard to the pattern
        pattern+= `[.]${wildcard}`;
        //create the regular expression object
        return new RegExp(pattern);
    }
    /**
    * @function
    */
    function getHandlers(namespace) {
        //split the namespace into segments
        var segments = namespace.split(".")
        //find the direct listener entry
        , listenerEntry = getListenerEntry(
            segments
        )
        , handlers = []
        ;
        //get any direct listener handlers
        if (!!listenerEntry) {
            handlers = Object.values(listenerEntry.handlers);
        }
        //get any wildcard handlers
        var scope = listener_tree;
        for(let i = 0, l = segments.length - 1; i < l; i++) {
            let name = segments[i];
            //name doesn't exist, listener not found
            if(!scope.hasOwnProperty(name)) {
                break;
            }
            //set the scope to the next branch
            scope = scope[name];
            //execute the callback function
            if (scope.hasOwnProperty("wildcards")) {
                for(let key in scope.wildcards) {
                    let wildcard = scope.wildcards[key];
                    if (wildcard.pattern.test(namespace)) {
                        handlers =
                            handlers.concat(
                                Object.values(wildcard.handlers)
                            );
                    }
                }
            }
            //move to the next branch if there are children
            if(!!scope.children) {
                scope = scope.children;
            }
            //otherwise listener not found
            else {
                break;
            }
        }

        return handlers;
    }
    /**
    * @function
    */
    function validateNamespace(namespace) {
        if (!NAMESPACE_PATT.test(namespace)) {
            throw new Error(
                `${errors.invalid_namespace}`
            );
        }
    }
    /**
    * @function
    */
    function validateUuids(uuids) {
        for(let i = 0, l = uuids.length; i < l; i++) {
            if (!is_uuid(uuids[i])) {
                throw Error(
                    `${errors.invalid_listener_uuid} (${uuids[i]})`
                );
            }
        }
    }
}