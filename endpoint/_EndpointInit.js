/**
* The endpoint init dependency initializes a state endpoint, taking an object of command arguments, loading a configuration file, if specified, adding default configuration values for missing one's, and finally loads the initial state object.
* @factory
*/
function _EndpointInit(
    promise
    , fileLoader
    , state_endpoint_endpoint
    , is_nill
    , is_string
    , is_object
    , utils_copy
    , utils_applyIf
    , defaults
) {

    /**
    * @constants
    */
    var cnsts = {
        "argsSkipKeys": [
            "config"
            , "environment"
        ]
    }
    /**
    * @alias
    */
    , endpoint = state_endpoint_endpoint
    /**
    * A regular expression pattern for removing a leading slash
    * @property
    */
    , LEADING_SLASH_PATT = /^[\\\/]/
    ;

    /**
    * @worker
    *   @parameter {object} args ,An object containing arguments for configuring the endpoint.
            @property {string} config The path to the configuration file.
            @property {string} environment A value identifying the environment in which the endpoint is running; node or browser.
            @property ... Additional properties included will be added to the configuration object, overwritting any values from the config file or defaults.
    */
    return function EndpointInit(args) {
        var proc = promise.resolve()
        , endpointConfig;

        if (is_object(args)) {
            //load the config file if a config cmdarg exists
            if (is_string(args.config)) {
                proc = proc.then(function thenLoadConfig() {
                    return loadFile(
                        args.config
                    );
                });
            }
            //merge the command line args with the config
            proc = proc.then(function thenMergeArgs(config) {
                return mergeArgs(
                    args
                    , config
                );
            });
        }
        //update the config with the defaults
        proc = proc.then(function thenAddDefaults(config) {
            return addConfigDefaults(
                config
            );
        });
        //load the initial state if there's a path in the config
        proc = proc.then(function thenLoadInitialState(config) {
            endpointConfig = config;
            if (config.statePath) {
                return loadFile(
                    getStateFilePath(
                        config
                    )
                );
            }
            return promise.resolve();
        });
        //start the endpoint
        return proc.then(function thenCreateEndpoint(initialState) {
            return endpoint(
                endpointConfig
                , initialState
            );
        });
    };

    /**
    * @function
    */
    function loadFile(path) {
        return fileLoader(
            path
        )
        .then(function thenConvertResult(result) {
            try {
                return promise.resolve(
                    JSON.parse(result)
                );
            }
            catch(ex) {
                return promise.reject(ex);
            }
        });
    }
    /**
    * @function
    */
    function getStateFilePath(config) {
        var statePath = config.statePath
            .replace(LEADING_SLASH_PATT, "");
        //don't add the base path if the statePAth starts with ./
        if (statePath.indexOf("./") === 0) {
            return statePath;
        }
        //add the base if it exists
        if (!is_nill(config.basePath)) {
            return `${config.basePath}/${statePath}`;
        }
        return statePath;
    }
    /**
    * @function
    */
    function mergeArgs(args, config = {}) {
        try {
            //loop through the args collection
            Object.keys(args)
            .forEach(function forEachArg(argKey) {
                if (cnsts.argsSkipKeys.indexOf(argKey) === -1) {
                    config[argKey] = args[argKey];
                }
            });

            return promise.resolve(config);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function addConfigDefaults(config) {
        try {
            config = utils_applyIf(
                utils_copy(defaults.statenet.endpoint.config)
                , config || {}
            );

            return promise.resolve(config);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
}