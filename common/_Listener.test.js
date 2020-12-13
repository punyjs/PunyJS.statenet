/**
* @test
*   @title PunyJS.statenet.common._Listener: basic test
*/
function listenerTest1(
    controller
    , mock_callback
) {
    var listenerManager, listener;

    arrange(
        async function arrangeFn() {
            listenerManager = {
                "$addListener": mock_callback()
                , "$removeListener": mock_callback()
                , "$hasListener": mock_callback()
            };
            listener = await controller(
                [
                    ":PunyJS.statenet.common._Listener"
                    , [
                        listenerManager
                    ]
                ]
            );
        }
    );

    act(
        function arrangeFn() {
            listener.$listen(
                "$.main.toolbar.button1"
            );
            listener.$listening(
                "$.main.toolbar.button1"
            );
            listener.$nolisten(
                "uuid"
            );
        }
    );

    assert(
        function arrangeFn(test) {
            test("listenerManager.$addListener should be called with")
            .value(listenerManager, "$addListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "$.main.toolbar.button1")
            ;

            test("listenerManager.$hasListener should be called with")
            .value(listenerManager, "$hasListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "$.main.toolbar.button1")
            ;

            test("listenerManager.$removeListener should be called with")
            .value(listenerManager, "$removeListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "uuid")
            ;
        }
    );
}