var Prop = require('../Prop')

/**
* Reads prop names and values, and updates entityState accordingly. Dynamically
*  chooses dataView reading functions depending on the EntitySchema. This is the
*  most black magicky function of this demo.
* @method readChangedProps
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readChangedProps(dataView, offset, entityState) {
	var id = -1
	var entity = false

	/* The server will send an entity id followed by any number of prop names 
	*    and values! For example it could send: id: 1, x: 200, radius: 34, r: 2,
	*    g: 30, b: 30, or id: 20, hellokitty: -219308. It could really be 
	*    anything. Because we don't know how many prop names and values might 
	*    follow the id, we keep reading until we hit another prop named 'id.' 
	*    The id will always come first, and we'll only receive misc props from
	*    entities that the client has already received in full in some point in
	*    the past. Because of these rules, we can load the entity from 
	*    entityState after we read the id, and then refer to the entity's schema
	*    to know how many bytes to read from the buffer per propName. The 
	*    propName itself is always 1 byte. We can continue reading misc props
	*    about misc entities until we hit the end of the buffer.
	*/

	// read to the end of the buffer
	while (offset < dataView.byteLength) {
		// assume the first byte of data represents a property (id, x, y, etc)
		var propCode = dataView.getUint8(offset, true)
		offset += 1
		//console.log('prop', Prop.getName(propCode))
		// translate the property from its code back to its name (0 -> id)
		var prop = Prop.getName(propCode)
		if (prop === 'id') {
			// if the prop is id, then fetch the known entity
			id = dataView.getUint16(offset, true)
			offset += 2
			entity = entityState.getById(id)
		} else {
			//console.log(entity, 'prop', prop, 'sc', entity.schema[prop])
			// if the prop isn't id, assume
			if (entity) {
				var value = dataView[entity.schema[prop].clReadFn](offset, true)
				offset += entity.schema[prop].bytes
				entityState.update(id, prop, value)
			}
		}		
	}
	return offset						
}

module.exports = readChangedProps