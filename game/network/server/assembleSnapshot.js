var categorizeEntities = require('./categorizeEntities')
var diffScan = require('./diffScan')

var writeChangedProps = require('./writeChangedProps')
var writeMovementDeltas = require('./writeMovementDeltas')
var writeUnsubscribes = require('./writeUnsubscribes')
var writeFullEntities = require('./writeFullEntities')
var countBytesForEntities = require('./countBytesForEntities')

/**
* Assembles a state snapshot for a client based on its prior entityState.
* Significant submodules:
*   checkAllChanges: scans entities for differences and necessary updates
*   categorizeEntities: groups entities into unsubscribes (entities the client
*       should forget), full updates (entities the client should receive in
        full), and partial udpates (entities that have experienced small misc 
        changes)
*   writeFullEntities: writes entire entities to the buffer
*   writeChangedProps: writes any change in an entity to the buffer
*   writeMovementDeltas: writes optmized movement (id, dx, dy) to the buffer
*   writeUnsubscribes: writes ids of entities to forget to the buffer
* @method assembleSnapshot
* @param {Array} entities Entities to include in this snapshot
* @param {EntityState} entityState A record of entity states for comparison
* @returns {Buffer} Returns a binary buffer
*/
function assembleSnapshot(entities, entityState) {    

    var nearbyIds = []
    for (var k = 0; k < entities.length; k++) {
        nearbyIds.push(entities[k].id)        
    }

    var cat = categorizeEntities(entities, nearbyIds, entityState)
    // client should forget these entities, they're too far away
    var unsubscribes = cat.unsubscribes
    // these entities are known to the client, and will be checked for changes
    var partial = cat.partial
    // these entities are new to the client, and will be sent in full
    var full = cat.full


    // scan the known entities, and figure out how to update them
    var changes = diffScan(partial, entityState)
    // entity data as a heavily optimized movement delta
    var movementDeltas = changes.movementDeltas
    // misc entity data as a propName:propValue set of changes
    var changedPropsPerEntity = changes.changedPropsPerEntity

    var bufferLength = countBytesForEntities(full)

    if (unsubscribes.length > 0) {
        bufferLength += 3
        for (var j = 0; j < unsubscribes.length; j++) {
            bufferLength += 2 // two bytes per id
        }
    }

    bufferLength += changes.bufferLength

    // if there was nothing to send, we're done already!
    if (bufferLength === 0)
        return

    var buffer = new Buffer(bufferLength)

    var offset = 0
    // write the full entities
    offset = writeFullEntities(full, buffer, offset, entityState)
    // write the entities to forget
    offset = writeUnsubscribes(unsubscribes, buffer, offset, entityState)
    // write the optimized movements
    offset = writeMovementDeltas(movementDeltas, buffer, offset, entityState)
    // write misc changes. Must always go last.
    offset = writeChangedProps(changedPropsPerEntity, buffer, offset, entityState)

    return buffer
}


module.exports = assembleSnapshot