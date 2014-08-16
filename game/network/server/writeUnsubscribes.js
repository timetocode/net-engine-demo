var MessageType = require('../MessageType')

/**
* Writes unsubcribes, which is a list of ids no longer relevant to a client. 
*   These entities have moved too far from the client, and the server will no  
*   longer be sending information about them, so the client should delete them.
* @method writeUnsubscribes
* @param {Array} unsubscribes Array of entity ids
* @param {Buffer} buffer Target buffer to write data
* @param {Integer} offset Offset at which to begin writing to the buffer
* @param {EntityState} entityState An entityState object in which to track any
*   any changes. Anything written will be sent to the client, so the entityState
*   must reflect the knowledge of the client.
* @return {Integer} Returns a new offset, incremented appropriately.
*/
function writeUnsubscribes(unsubscribes, buffer, offset, entityState) {
    // unsubscribes
    if (unsubscribes.length) {
        //console.log('writing unsubscribes to buffer', unsubscribes.length, 'offset', offset, '/', bufferLength)
        buffer.writeUInt8(MessageType.Unsubscribes, offset)
        offset += 1
        buffer.writeUInt16LE(unsubscribes.length, offset)
        offset += 2

        for (var j = 0; j < unsubscribes.length; j++) {
            var id = unsubscribes[j]
            buffer.writeUInt16LE(id, offset)
            offset += 2
            entityState.remove(id)
        }

    } 
    return offset
}

module.exports = writeUnsubscribes