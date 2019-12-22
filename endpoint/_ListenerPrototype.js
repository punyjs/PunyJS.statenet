/**
* @factory
*/
function _ListenerPrototype (
    endpoint_listenerManager
) {
    /**
    * The property descriptor used to create the prototype
    * @property
    */
    var propertyDescriptor = {
        "": {

        }
        , "": {

        }
        , "": {

        }
    };

    /**
    * @worker
    */
    return function ListenerPrototype (
        basePrototype
    ) {
        //make sure we have a base prototype
        if (!is_object(basePrototype)) {
            basePrototype = Object.prototype;
        }
        //create a new prototype object with the base as its prototype
        return Object.create(
            basePrototype
            ,
        );
    };
}