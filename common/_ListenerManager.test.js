/**
* @test
*   @title PunyJS.statenet.common._ListenerManager: basic test
*/
function listenerManagerTest1(
    controller
    , mock_callback
) {
    var listenerManager, cb1, cb2;

    arrange(
        async function arrangeFn() {
            listenerManager = await controller(
                [
                    ":PunyJS.statenet.common._ListenerManager"
                    , []
                ]
            );
            cb1 = mock_callback();
            cb2 = mock_callback();
        }
    );

    act(
        function arrangeFn() {
            listenerManager.$addListener(
                "state.screens._currentScreen"
                , cb1
            );

            listenerManager.$addListener(
                "state.toolbar.items.0"
                , cb2
            );

            listenerManager.$fireListener(
                "state.screens._currentScreen"
                , "set"
                , "value1"
            );

            listenerManager.$fireListener(
                "state.toolbar.items.0"
                , "get"
                , "value2"
            );
        }
    );

    assert(
        function arrangeFn(test) {
            test("The first callback should be called with")
            .value(cb1)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'value1')
            ;

            test("The second callback should be called with")
            .value(cb2)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'value2')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._ListenerManager: restricted actions
*/
function listenerManagerTest2(
    controller
    , mock_callback
) {
    var listenerManager, cb1, cb2;

    arrange(
        async function arrangeFn() {
            listenerManager = await controller(
                [
                    ":PunyJS.statenet.common._ListenerManager"
                    , []
                ]
            );
            cb1 = mock_callback();
            cb2 = mock_callback();
        }
    );

    act(
        function arrangeFn() {
            listenerManager.$addListener(
                "state.screens._currentScreen"
                , cb1
                , 'get'
            );

            listenerManager.$addListener(
                "state.toolbar.items.0"
                , cb2
                , 'get'
            );

            listenerManager.$fireListener(
                "state.screens._currentScreen"
                , "set"
                , "value1"
            );

            listenerManager.$fireListener(
                "state.toolbar.items.0"
                , "get"
                , "value2"
            );
        }
    );

    assert(
        function arrangeFn(test) {
            test("The first callback should be called with")
            .value(cb1)
            .hasBeenCalled(0)
            ;

            test("The second callback should be called with")
            .value(cb2)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'value2')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._ListenerManager: $every, $all
*/
function listenerManagerTest3(
    controller
    , mock_callback
) {
    var listenerManager, cb1, cb2, cb3;

    arrange(
        async function arrangeFn() {
            listenerManager = await controller(
                [
                    ":PunyJS.statenet.common._ListenerManager"
                    , []
                ]
            );
            cb1 = mock_callback();
            cb2 = mock_callback();
            cb3 = mock_callback();
        }
    );

    act(
        function arrangeFn() {
            listenerManager.$addListener(
                "state.$every._currentScreen"
                , cb1
                , 'get'
            );

            listenerManager.$addListener(
                "state.$every._nextScreen"
                , cb1
                , 'get'
            );

            listenerManager.$addListener(
                "state.toolbar.$every"
                , cb3
                , 'get'
            );

            listenerManager.$addListener(
                "state.toolbar.$all"
                , cb2
                , 'get'
            );

            listenerManager.$fireListener(
                "state.screens._currentScreen"
                , "get"
                , "value1"
            );

            listenerManager.$fireListener(
                "state.screens._nextScreen"
                , "get"
                , "value2"
            );

            listenerManager.$fireListener(
                "state.toolbar.items.0"
                , "get"
                , "value2"
            );

            listenerManager.$fireListener(
                "state.toolbar.items.2"
                , "get"
                , "value3"
            );
        }
    );

    assert(
        function arrangeFn(test) {
            test("The first callback should be called with")
            .value(cb1)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, 'value1')
            .hasBeenCalledWithArg(1, 0, 'value2')
            ;

            test("The second callback should be called with")
            .value(cb2)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, 'value2')
            .hasBeenCalledWithArg(1, 0, 'value3')
            ;

            test("The third callback should be called with")
            .value(cb3)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, 'value2')
            .hasBeenCalledWithArg(1, 0, 'value3')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._ListenerManager: has and remove
*/
function listenerManagerTest4(
    controller
    , mock_callback
) {
    var listenerManager, uuid, has1, has2, cb;

    arrange(
        async function arrangeFn() {
            listenerManager = await controller(
                [
                    ":PunyJS.statenet.common._ListenerManager"
                    , []
                ]
            );
            cb = mock_callback();
        }
    );

    act(
        function arrangeFn() {
            uuid = listenerManager.$addListener(
                '$.main.screens.$every._screenId'
                , cb
            );
            has1 = listenerManager.$hasListener(
                '$.main.screens.screen1._screenId'
                , cb
            );
            listenerManager.$fireListener(
                '$.main.screens.screen1._screenId'
                , "set"
                , "details"
            );
            listenerManager.$removeListener(
                uuid
            );
            has2 = listenerManager.$hasListener(
                '$.main.screens.screen1._screenId'
                , cb
            );
            listenerManager.$fireListener(
                '$.main.screens.screen1._screenId'
                , "set"
                , "details2"
            );
        }
    );

    assert(
        function arrangeFn(test) {
            test("The uuid should be an array")
            .value(uuid)
            .isOfType("array")
            ;

            test("The cb should be called once")
            .value(cb)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'details')
            ;

            test("The has1 should be true")
            .value(has1)
            .equals(true)
            ;

            test("The has2 should be false")
            .value(has2)
            .equals(false)
            ;
        }
    );
}