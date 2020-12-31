/**
* @test
*   @title PunyJS.statenet.common._StateManager: basic test
*/
function stateManagerTest1(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state;

    arrange(
        async function arrangeFn() {
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , [

                    ]
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The state should be")
            .value(state)
            .isOfType("object")
            ;

            test("The state should have property")
            .value(state)
            .hasOwnProperty("toolbar")
            ;

            test("The state.toolbar should have property")
            .value(state, "toolbar")
            .hasOwnProperty("items")
            ;

            test("The state.main should have property")
            .value(state, "main")
            .hasOwnProperty("left")
            ;

            test("The state should have addListener property")
            .value(state)
            .hasProperty("$addListener")
            ;

            test("The state.toolbar.items should have addListener property")
            .value(state, "toolbar.items")
            .hasProperty("$addListener")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: set, get
*/
function stateManagerTest2(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state, listenerManager;

    arrange(
        async function arrangeFn() {
            listenerManager = {
                "$fireListener": mock_callback(
                    function mockFireListener(...args) {
                        //console.log(args)
                    }
                )
            };
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , [
                        ,
                        , listenerManager
                    ]
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
            state.toolbar.title = "new title";
            state.main.left.rows.push([3,"row3"]);
            state.main.left.rows[1][1] = "update3";
        }
    );

    assert(
        function assertFn(test) {
            test("The fireListener callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalled(13)
            .hasBeenCalledWithArg(0, 0, "$.toolbar")
            .hasBeenCalledWithArg(0, 1, "get")
            ;

            test("The fireListener 8th callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(6, 0, "$.main.left.rows.2")
            .hasBeenCalledWithArg(6, 1, "set")
            .getCallbackArg(6, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.2","trap":"set","miss":true,"typeChange":false,"success":true}')
            ;

            test("The fireListener 14th callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(12, 0, "$.main.left.rows.1.1")
            .hasBeenCalledWithArg(12, 1, "set")
            .getCallbackArg(12, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.1.1","trap":"set","miss":false,"typeChange":false,"oldValue":"row2","success":true}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: delete, get
*/
function stateManagerTest3(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state, listenerManager;

    arrange(
        async function arrangeFn() {
            listenerManager = {
                "$fireListener": mock_callback(
                    function mockFireListener(...args) {
                        //console.log(args)
                    }
                )
            };
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , [
                        ,
                        , listenerManager
                    ]
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
            delete state.toolbar.title;
            delete state.main.left.rows[0];
        }
    );

    assert(
        function assertFn(test) {
            test("The fireListener callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalled(6)
            .hasBeenCalledWithArg(1, 0, "$.toolbar.title")
            .hasBeenCalledWithArg(1, 1, "delete")
            ;

            test("The fireListener 8th callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(5, 0, "$.main.left.rows.0")
            .hasBeenCalledWithArg(5, 1, "delete")
            .getCallbackArg(5, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.0","trap":"delete","miss":false,"success":true}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: apply, get
*/
function stateManagerTest4(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state, listenerManager;

    arrange(
        async function arrangeFn() {
            listenerManager = {
                "$fireListener": mock_callback(
                    function mockFireListener(...args) {
                        //console.log(args)
                    }
                )
            };
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , [
                        ,
                        , listenerManager
                    ]
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                        , "addRow": mock_callback()
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
            state.main.left.addRow([3,"row3"]);
        }
    );

    assert(
        function assertFn(test) {
            test("The fireListener callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalled(4)
            .hasBeenCalledWithArg(3, 0, "$.main.left.addRow")
            .hasBeenCalledWithArg(3, 1, "apply")
            .getCallbackArg(3, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.addRow","trap":"apply","scope":{"rows":[[1,"row1"],[2,"row2"]]},"arguments":[[3,"row3"]]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: add / remove / has listener
*/
function stateManagerTest5(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state, listenerManager;

    arrange(
        async function arrangeFn() {
            listenerManager = {
                "$addListener": mock_callback()
                , "$removeListener": mock_callback()
                , "$hasListener": mock_callback()
                , "$fireListener": mock_callback()
            };
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , [
                        ,
                        , listenerManager
                    ]
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                        , "addRow": mock_callback()
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
            state.toolbar.$addListener(
                'title'
            );
            state.main.left.$addListener(
                '$every'
            );
            state.$hasListener(
                'main.left.rows'
            );
            state.main.$removeListener(
                'uuid'
            );
        }
    );

    assert(
        function assertFn(test) {
            test("$addListener should be called with")
            .value(listenerManager, "$addListener")
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, '$.toolbar.title')
            .hasBeenCalledWithArg(1, 0, '$.main.left.$every')
            ;

            test("$hasListener should be called with")
            .value(listenerManager, "$hasListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, '$.main.left.rows')
            ;

            test("$removeListener should be called with")
            .value(listenerManager, "$removeListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'uuid')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: regression, duplicate keys
*/
function stateManagerTest6(
    controller
    , mock_callback
) {
    var stateManager, config, initialState, state, listenerManager, keys;

    arrange(
        async function arrangeFn() {
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , []
                ]
            );
            initialState = {
                "toolbar": {
                    "title": "navigation toolbar"
                    , "items": {
                        "btnBack": {
                            "enabled": true
                            , "_icon": "back_icon"
                            , "_focused": true
                        }
                        , "btnForward": {
                            "enabled": false
                            , "_icon": "forward_icon"
                            , "_focused": false
                        }
                    }
                }
                , "main": {
                    "left": {
                        "rows": [
                            [1,"row1"]
                            , [2,"row2"]
                        ]
                        , "addRow": mock_callback()
                    }
                    , "right": {
                        "_url":"/profile/pic"
                    }
                }
                , "$addListener": "duplicate"
            };
            config = {};
        }
    );

    act(
        function actFn() {
            state = stateManager(
                config
                , initialState
            );
            //this will throw an error if we don't deal with the duplicate $addListener key
            keys = Object.keys(state);
        }
    );

    assert(
        function assertFn(test) {
            test("keys should be")
            .value(keys)
            .stringify()
            .equals('["toolbar","main","$addListener"]')
            ;

            test("$addListener should not equal 'dupplicate'")
            .value(state, "$addListener")
            .not
            .equals(initialState.$addListener)
            ;
        }
    );
}