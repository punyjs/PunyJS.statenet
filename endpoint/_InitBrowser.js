/**
*
* @factory
*/
function _InitBrowser(
    promise
    , state_endpoint_endpointInit
    , browser_url
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
    return function InitBrowser(href) {
        try {
            var url = new browser_url(href)
            , basePath = extractBasePath(url)
            , args = getArguments(
                url.searchParams
            )
            ;
            //create the fq path for the config if present
            if (args.hasOwnProperty("config")) {
                args.config = resolveConfigPath(
                    args.config
                    , basePath
                );
            }
            args.environment = "browser";
            args.basePath = basePath;
            args.rootPath = url.origin;
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
    function extractBasePath(url) {
        //split the path into segments
        var path = url.pathname
        , segments = path.split(PATH_SEP_PATT)
        , lastSeg = segments[segments.length -1]
        ;
        //remove the last segment if it matches the file pattern
        if (lastSeg.match(NAME_PATT)) {
            segments.pop();
        }

        return url.origin + segments.join("/");
    }
    /**
    * Adds the base path to the config
    * @function
    */
    function resolveConfigPath(configPath, basePath) {
        //if the config begins with a ./ then don't add the base
        if (configPath.indexOf("./") === 0) {
            return configPath;
        }
        else {
            return `${basePath}/${configPath}`;
        }
    }
    /**
    * Iterates through the search params and add each to the args object
    * @function
    */
    function getArguments(searchParams) {
        var args = {};

        Array.from(searchParams.keys())
        .forEach(function forEachSearchParamKey(key) {
            args[key] = searchParams.get(key);
        });

        return args;
    }
}