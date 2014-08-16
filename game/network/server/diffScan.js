var Prop = require('../Prop')

/**
* Scans entities vs a client's knowledge of their prior state, and generates  
* a list of properties to update AND a list of compact movement updates. Also
* tallies the total number of bytes this information would occupy.
* @method diffScan
* @param {Array} entities The entities to check
* @param {EntityState} entityState An entityState object to compare for diffs
* @return {Object} Returns an object wrapping the movementDeltas, 
*   changedPropsPerEntity, and bufferLength in bytes
*/
function diffScan(entities, entityState) {
    var bufferLength = 0
    var movementDeltas = []
    var changedPropsPerEntity = []
    for (var k = 0; k < entities.length; k++) {
        var entity = entities[k]

        var changes = analyzeChanges(
            entity, 
            entityState.getById(entity.id), 
            entity.schema
        )

        var changedProps = changes.changedProps
        var movementDelta = changes.movementDelta

        if (changedProps.length > 0) {
            // the props that changed and the current entity 
            changedPropsPerEntity.push({ changedProps: changedProps, entity: entity })

            for (var j = 0; j < changedProps.length; j++) {
                //console.log('writing', props[j], 'bytes', EntitySchema[props[j]].bytes)
                // two bytes for the prop name
                bufferLength += Prop.binaryType.bytes
                // lookup byte length of this type of prop
                bufferLength += entity.schema[changedProps[j]].bytes                    
            }
        }

        if (movementDelta.length > 0) {
            movementDeltas.push(movementDelta)
        }
    }

    if (changedPropsPerEntity.length > 0) {
        bufferLength += 1
    }

    if (movementDeltas.length > 0) {
        // 1 for message type
        // 2 for for movementDeltas.length
        bufferLength += 3
        //console.log('movementDeltas planned', movementDeltas.length)
        for (var j = 0; j < movementDeltas.length; j++) {
            // 4 per compact movement 2 for id, 1 for dx 1 for dy
            bufferLength += 4
        }
    }

    return {
        movementDeltas: movementDeltas,
        changedPropsPerEntity: changedPropsPerEntity,
        bufferLength: bufferLength
    }
}

/*
* Finds all properties in an object that differ from another object
* Used to build a list of changed properties between game ticks
* Always includes an 'id' if there are changes
* @method analyzeChanges
* @param {Object} curr The current state of an object or entity
* @param {Object} prev The previous state of an object or entity
* @param {Schema} schema A schema containing relevant property names
* @return {Object} Returns an object wrapping 1) array of property names that 
*   have changed, and 2) a movement delta
*/
var analyzeChanges = function(curr, prev, schema) {

    var movementDelta = []
    var skipXY = false
    // see if the entity's position could be microoptimized into a dx and dy
    if (typeof prev !== 'undefined' && 'x' in schema && 'y' in schema) {
        if (curr['x'] !== prev['x'] || curr['y'] !== prev['y']) {
            var dx = curr['x'] - prev['x']
            var dy = curr['y'] - prev['y']

            // is the change in position within one signed byte ?
            if (dx >= -128 && dx <= 127 && dy >= -128 && dy <= 127) {
                // store movementDelta as array: [id, dx, dy]
                movementDelta = [curr['id'], Math.round(dx), Math.round(dy)]
                // flag that x and y are already handled for this entity
                skipXY = true
            }
        }
    }
    var changedProps = []
    changedProps.push('id') // always include id
    if (skipXY) {
        // movement is already handled, so don't look for x or y
        // but continue to scan for any other changed properties
        for (var prop in schema) {      
            if ((typeof prev === 'undefined' || curr[prop] !== prev[prop]) 
                && prop !== 'id' && prop !== 'x' && prop !== 'y') {
                changedProps.push(prop)
            }
        }
    } else {
        // scan for any changed properties
        for (var prop in schema) {     
            if ((typeof prev === 'undefined' || curr[prop] !== prev[prop]) 
                && prop !== 'id') {
                changedProps.push(prop)
            }
        }
    }
    // if changedProps only contains one item (id) then nothing was found, make it an
    // empty array
    changedProps = (changedProps.length === 1) ? [] : changedProps

    return {
        movementDelta: movementDelta,
        changedProps: changedProps
    }
}


module.exports = diffScan