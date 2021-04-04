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
            .equals('{"namespace":"$.toolbar.title","name":"title","parentNamespace":"$.toolbar","action":"set","miss":false,"typeChange":false,"value":"new title","oldValue":"navigation toolbar"}')
            ;

            test("The fireListener 2nd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(1, 0, "$.main.left.rows.2")
            .hasBeenCalledWithArg(1, 1, "set")
            .getCallbackArg(1, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.2","name":"2","parentNamespace":"$.main.left.rows","action":"set","arrayAction":"append","miss":true,"typeChange":false,"value":[3,"row3"]}')
            ;

            test("The fireListener 3rd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(2, 0, "$.main.left.rows.1.1")
            .hasBeenCalledWithArg(2, 1, "set")
            .getCallbackArg(2, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.1.1","name":"1","parentNamespace":"$.main.left.rows.1","action":"set","arrayAction":"replace","miss":false,"typeChange":false,"value":"update3","oldValue":"row2"}')
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
            .equals('{"namespace":"$.toolbar.title","name":"title","parentNamespace":"$.toolbar","action":"delete","miss":false,"success":true}')
            ;

            test("The fireListener 2nd callback should be called with")
            .value(listenerManager, "$fireListener")
            .hasBeenCalledWithArg(1, 0, "$.main.left.rows.0")
            .hasBeenCalledWithArg(1, 1, "delete")
            .getCallbackArg(1, 2)
            .stringify()
            .equals('{"namespace":"$.main.left.rows.0","name":"0","parentNamespace":"$.main.left.rows","action":"delete","arrayAction":"delete","miss":false,"typeChange":false,"oldValue":[1,"row1"],"success":true}')
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
            .equals('{"namespace":"$.main.left.addRow","name":"0","parentNamespace":"$.main.left.rows","action":"apply","scope":{"rows":[[1,"row1"],[2,"row2"]]},"arguments":[[3,"row3"]]}')
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
/**
* @test
*   @title PunyJS.statenet.common._StateManager: regression, state as prototype
*/
function stateManagerTest7(
    controller
    , mock_callback
) {
    var stateManager, initialState, state, listenerManager, context;

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
        }
    );

    act(
        function actFn() {
            state = stateManager(
                null
                , initialState
            );
            context = Object.create(
                state
            );
            state.title = "new title";
            context.prop1 = "value2";
        }
    );

    assert(
        function assertFn(test) {
            test("The state should not have a prop1 property")
            .value(state)
            .not
            .hasOwnProperty("prop1")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.statenet.common._StateManager: sym link
*/
function stateManagerTest8(
    controller
    , mock_callback
) {
    var stateManager, initialState, state, listenerManager, context, cb1, cb2;

    arrange(
        async function arrangeFn() {
            stateManager = await controller(
                [
                    ":PunyJS.statenet.common._StateManager"
                    , []
                ]
            );
            initialState = {
                "items": [
                    {
                        "name": "item1"
                    }
                    , {
                        "name": "item2"
                    }
                ]
                , "currentItem": {
                    "name": "item1"
                }
            };
            cb1 = mock_callback();
            cb2 = mock_callback();
        }
    );

    act(
        function actFn() {
            state = stateManager(
                null
                , initialState
            );
            state.$addListener(
                "items.$every.name"
                , cb1
            );
            state.$addListener(
                "currentItem.name"
                , cb2
            );
            state.currentItem = state.items[0];
            state.currentItem.name = "updated";

            state.currentItem = state.items[1];
            state.currentItem.name = "updated2";
        }
    );

    assert(
        function assertFn(test) {
            test("cb1 should be called with")
            .value(cb1)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 1, '$.items.0.name')
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"namespace":"$.items.0.name","name":"name","parentNamespace":"$.items.0","action":"set","miss":false,"typeChange":false,"value":"updated","oldValue":"item1"}')
            ;

            test("cb2 should be called with")
            .value(cb2)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 1, '$.currentItem.name')
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"namespace":"$.currentItem.name","name":"name","parentNamespace":"$.currentItem","action":"set","miss":false,"typeChange":false,"value":"updated","oldValue":"item1"}')
            ;

            test("cb1 should be called second with")
            .value(cb1)
            .hasBeenCalledWithArg(1, 1, '$.items.1.name')
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"namespace":"$.items.1.name","name":"name","parentNamespace":"$.items.1","action":"set","miss":false,"typeChange":false,"value":"updated2","oldValue":"item2"}')
            ;

            test("cb2 should be called second with")
            .value(cb2)
            .hasBeenCalledWithArg(1, 1, '$.currentItem.name')
            .getCallbackArg(1, 0)
            .stringify()
            .equals('{"namespace":"$.currentItem.name","name":"name","parentNamespace":"$.currentItem","action":"set","miss":false,"typeChange":false,"value":"updated2","oldValue":"item2"}')
            ;
        }
    );
}