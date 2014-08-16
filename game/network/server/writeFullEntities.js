var MessageType = require('../MessageType')

/*
* Writes full entities to a buffer, references the entity schema to figure out
* which properties will be written and how many bytes each occupies
* @method writeFullEntities
* @param {Array} entities
* @param {Buffer} buffer
* @param {Integer} offset
* @param {EntityState} entityState
*/
function writeFullEntities(entities, buffer, offset, entityState) { 
    //console.log('writeFullEntities', entities, entities.length)

    //console.log('writing', MessageType.FullEntities, '@', offset)

    if (!entities.length)
        return offset

    buffer.writeUInt8(MessageType.FullEntities, offset)
    offset += 1

    ///console.log('writing', entities.length, '@', offset)
    buffer.writeUInt16LE(entities.length, offset)
    offset += 2

    for (var k = 0; k < entities.length; k++) {
        var entity = entities[k]

        // write id and type first
        buffer[entity.schema['id'].svWriteFn](entity.id, offset)
        offset += entity.schema['id'].bytes

        buffer[entity.schema['type'].svWriteFn](entity.type, offset)
        offset += entity.schema['type'].bytes

        entityState.update(entity.id, 'type', entity.type)

        // write the rest of the props
        for (var prop in entity.schema) {
            if (prop !== 'id' && prop !== 'type') {
                //console.log('writing', prop, Math.round(entity[prop]), '@', offset)
                buffer[entity.schema[prop].svWriteFn](Math.round(entity[prop]), offset)
                offset += entity.schema[prop].bytes
                entityState.update(entity.id, prop, entity[prop])

                
            }
        }
    }
    return offset
}


module.exports = writeFullEntities