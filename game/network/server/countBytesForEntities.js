/*
* Scans a list of entities and returns the total byte size. Used for initalizing
*   a buffer (which requires a known length).
* @method countBytesForEntities
* @param {Array} entities Entities
* @return {Integer} Returns a buffer length in bytes for the given entities
*/
function countBytesForEntities(entities) {
 
    var bufferLength = 0
    if (entities.length > 0) {
        bufferLength += 3
    }
    for (var k = 0; k < entities.length; k++) {
        var entity = entities[k]       
        for (var prop in entity.schema) {
            //console.log('prop', prop, bufferLength)
            bufferLength += entity.schema[prop].bytes
        }
    }
    return bufferLength
}


module.exports = countBytesForEntities