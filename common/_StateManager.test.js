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
            .hasBeenCalled(3)
            .hasBeenCalledWithArg(0, 0, "$.toolbar.title")
            .hasBeenCalledWithArg(0, 1, "set")
            .getCallbackArg(0, 2)
            .stringify()
            .equals('{"namespace":"$.toolbar.title","action":"set","miss":false,"typeChange":false,"value":"new title","oldValue":"navigation toolbar"}')
            ;

            test("The fireListener 2nd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(1, 0, "$.main.left.rows.2")
            .hasBeenCalledWithArg(1, 1, "set")
            .getCallbackArg(1, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.2","action":"set","arrayAction":"append","miss":true,"typeChange":false,"value":[3,"row3"]}')
            ;

            test("The fireListener 3rd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(2, 0, "$.main.left.rows.1.1")
            .hasBeenCalledWithArg(2, 1, "set")
            .getCallbackArg(2, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.1.1","action":"set","arrayAction":"replace","miss":false,"typeChange":false,"value":"update3","oldValue":"row2"}')
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
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, "$.toolbar.title")
            .hasBeenCalledWithArg(0, 1, "delete")
            .getCallbackArg(0, 2)
            .stringify()
            .equals('{"namespace":"$.toolbar.title","action":"delete","miss":false,"success":true}')
            ;

            test("The fireListener 2nd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(1, 0, "$.main.left.rows.0")
            .hasBeenCalledWithArg(1, 1, "delete")
            .getCallbackArg(1, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.0","action":"delete","arrayAction":"delete","miss":false,"oldValue":[1,"row1"],"success":true}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: apply
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
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "$.main.left.addRow")
            .hasBeenCalledWithArg(0, 1, "apply")
            .getCallbackArg(0, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.addRow","action":"apply","scope":{"rows":[[1,"row1"],[2,"row2"]]},"arguments":[[3,"row3"]]}')
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

            test("$addListener should not equal 'duplicate'")
            .value(state, "$addListener")
            .not
            .equals(initialState.$addListener)
            ;
        }
    );
}