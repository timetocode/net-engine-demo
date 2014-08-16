/**
* Reads unsubscribe ids and removes them from entityState
* @method readChangedProps
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readUnsubscribes(dataView, offset, entityState) {
	var unsubscribeLength = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < unsubscribeLength; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2
		entityState.remove(id)
	}
	return offset
}

module.exports = readUnsubscribes