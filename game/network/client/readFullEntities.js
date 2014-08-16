var Prop = require('../Prop')

/**
* Reads full entities from the buffer. The entity id and type are always sent
* first, and calling entityState.update on these values will create the correct
* type of entity (e.g. an instance of NPC, or whatever). From the instance, we
* can read the schema, and the schema will specify how many bytes to read at a
* time and which properties to expect in the buffer.
* @method readFullEntities
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readFullEntities(dataView, offset, entityState) {

	var length = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < length; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2

		var type = dataView.getUint8(offset, true)
		offset += 1

		entityState.update(id, 'type', type)

		var entity = entityState.getById(id)

		for (var prop in entity.schema) {
		    if (prop !== 'id' && prop !== 'type') {
		        var value = dataView[entity.schema[prop].clReadFn](offset, true)
		        offset += entity.schema[prop].bytes

		        entityState.update(id, prop, value)
		    }
		}
	}
	return offset
}

module.exports = readFullEntities