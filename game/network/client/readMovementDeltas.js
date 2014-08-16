/**
* Reads movement updates and applies them via entityState
* @method readMovementDeltas
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readMovementDeltas(dataView, offset, entityState) {
	var length = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < length; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2
		var dx = dataView.getInt8(offset)
		offset += 1
		var dy = dataView.getInt8(offset)
		offset += 1

		entityState.updateWithMovementDelta(id, dx, dy)
	}
	return offset
}

module.exports = readMovementDeltas