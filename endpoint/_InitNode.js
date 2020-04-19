/**
*
* @factory
*/
function _InitNode(
    promise
    , state_endpoint_endpointInit
    , is_object
    , utils_copy
    , node_path
    , node_process
) {
    /**
    * A regular expressions pattern for splitting file paths
    * @property
    */
    var PATH_SEP_PATT = /[\\\/]/g
    /**
    * A regular expressions pattern for matching file names
    * @property
    */
    , NAME_PATT = /[.][A-z]+$/
    ;

    /**
    * @worker
    */
    return function InitNode(cmdArgs) {
        cmdArgs = cmdArgs || {};
        try {
            var arguments = cmdArgs.arguments
            , basePath = extractPath(cmdArgs._script)
            //create the args object, using the arguments from the command line if present
            , args = is_object(arguments)
                ? utils_copy(arguments) //remove external reference
                : {}
            ;
            //create the fq path for the config if present
            if (args.hasOwnProperty("config")) {
                args.config = resolveConfigPath(
                    args.config
                    , basePath
                );
            }
            args.environment = "node";
            args.basePath = basePath;
            args.rootPath = extractPath(
                node_process.cwd()
            );
            //execute the endpoint init, it returns a promise, pass that through
            return state_endpoint_endpointInit(
                args
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };

    /**
    * Converts the cmdArgs' _script path into the base path for the application
    * @function
    */
    function extractPath(scriptPath) {
        //split the path into segments
        var segments = scriptPath.split(PATH_SEP_PATT)
        , lastSeg = segments[segments.length -1]
        ;
        //remove the last segment if it matches the file pattern
        if (lastSeg.match(NAME_PATT)) {
            segments.pop();
        }

        return segments.join("/");
    }
    /**
    * Adds the base path to the config
    * @function
    */
    function resolveConfigPath(configPath, basePath) {
        //if the config begins with a ./ then don't add the base
        if (configPath.indexOf("./") === 0) {
            return node_path.resolve(
                configPath
            );
        }
        else {
            return node_path.join(
                basePath
                , configPath
            );
        }
    }
}