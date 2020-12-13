/**
* @test
*   @name controller
*   @type setup
*/
async function setupStatenetController(
    $entry
    , $client
    , $import
    , $global
    , $reporter
) {
    try {
        var mocks = {
            "fs": {}
            , "path": {}
        }
        , controller = await $import(
            "controller"
            , mocks
        )
        , container = await $import(
            "app"
        )
        , dtree = await $import(
            "app1"
        )
        ;

        controller
            .setup
            .setContainer(container)
            .setAbstractTree(dtree)
            .setGlobal($global)
        ;

        controller
            .dependency
            .add(
                ".reporter"
                , $reporter
            )
        ;

        return $global.Promise.resolve(controller);
    }
    catch(ex) {
        return $global.Promise.reject(ex);
    }
}