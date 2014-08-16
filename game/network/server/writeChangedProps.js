var MessageType = require('../MessageType')
var Prop = require('../Prop')

/**
* Writes a very dynamic set of entity properties to a buffer, references 
*   entity.schema to know the data type and byte size of each property.
* @method writeChangedProps
* @param {Array} changedPropsPerEntity An array of wrappers for an entity and 
*   its changed properties
* @param {Buffer} buffer Target buffer to write data
* @param {Integer} offset Offset at which to begin writing to the buffer
* @param {EntityState} entityState An entityState object in which to track any
*   any changes. Anything written will be sent to the client, so the entityState
*   must reflect the knowledge of the client.
* @return {Integer} Returns a new offset, incremented appropriately.
*/
function writeChangedProps(changedPropsPerEntity, buffer, offset, entityState) {

    if (changedPropsPerEntity.length > 0) {
        //console.log('writing misc properties', movementDeltas.length, 'offset', offset, '/', bufferLength)
        buffer.writeUInt8(MessageType.MiscProperties, offset)
        offset += 1

        for (var k = 0; k < changedPropsPerEntity.length; k++) {
            var entity = changedPropsPerEntity[k].entity
            var props = changedPropsPerEntity[k].changedProps
      
            for (var j = 0; j < props.length; j++) {
                //console.log(props[j], entity.schema[props[j]].svWriteFn, entity.schema[props[j]].bytes, Math.round(entity[props[j]]))
                var prop = props[j]
                var value = Math.round(entity[props[j]])

                buffer.writeUInt8(Prop.getCode(prop), offset)
                offset += Prop.binaryType.bytes
                buffer[entity.schema[prop].svWriteFn](value, offset)
                offset += entity.schema[prop].bytes

                entityState.update(entity.id, prop, value)
                //console.log(prop, value, 'offset', offset, '/', bufferLength)    
            }
        }                        
    }
    return offset
}

module.exports = writeChangedProps