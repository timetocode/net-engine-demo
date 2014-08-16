var MessageType = require('../MessageType')

/**
* Writes movementDeltas, which are small optimized representations of entity 
*   movement represented by an id, dx, dy (4 bytes total)
* @method writeMovementDeltas
* @param {Array} movementDeltas Array of movementDeltas (which are 3 items ea)
* @param {Buffer} buffer Target buffer to write data
* @param {Integer} offset Offset at which to begin writing to the buffer
* @param {EntityState} entityState An entityState object in which to track any
*   any changes. Anything written will be sent to the client, so the entityState
*   must reflect the knowledge of the client.
* @return {Integer} Returns a new offset, incremented appropriately.
*/
function writeMovementDeltas(movementDeltas, buffer, offset, entityState) {
    // momvement deltas (optimized movement of dx and dx)
    if (movementDeltas.length > 0) {
        //console.log('writing movementDeltas to buffer', movementDeltas.length, 'offset', offset, '/', bufferLength)
        buffer.writeUInt8(MessageType.CompactMovements, offset)
        offset += 1

        buffer.writeUInt16LE(movementDeltas.length, offset)
        offset += 2

        for (var j = 0; j < movementDeltas.length; j++) {
            var id = movementDeltas[j][0]
            var dx = movementDeltas[j][1]
            var dy = movementDeltas[j][2]

            buffer.writeUInt16LE(id, offset)
            offset += 2
            buffer.writeInt8(dx, offset)
            offset += 1
            buffer.writeInt8(dy, offset)
            offset += 1

            entityState.updateWithMovementDelta(id, dx, dy)
        }
    }
    return offset
}

module.exports = writeMovementDeltas