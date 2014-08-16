var MessageType = require('../MessageType')
var readMovementDeltas = require('./readMovementDeltas')
var readUnsubscribes = require('./readUnsubscribes')
var readChangedProps = require('./readChangedProps')
var readFullEntities = require('./readFullEntities')

/**
* Reads binary messages, looks for the MessageType flag and calls the
*  appropriate reader. See /game/network/client/ for readers
* @method readBinaryMessageData
* @param {Object} data The binary data property of a websocket message
* @param {EntityState} entityState The entityState where data will be recorded
*/
function readBinaryMessageData(data, entityState) {
	var dataView = new DataView(data)
	var offset = 0
	
	while (offset < dataView.byteLength) {
		var msgType = dataView.getUint8(offset, true)
		offset += 1
		//console.log(msgType)
		switch (msgType) {
			case MessageType.Unsubscribes:
				//console.log('Unsubscribes')
				offset = readUnsubscribes(dataView, offset, entityState)
				break
			case MessageType.CompactMovements:
				//console.log('CompactMovements')
				offset = readMovementDeltas(dataView, offset, entityState)				
				break
			case MessageType.FullEntities:
				//console.log('FullEntities')
				offset = readFullEntities(dataView, offset, entityState)
				break
			case MessageType.MiscProperties:
				//console.log('MiscProperties')
				offset = readChangedProps(dataView, offset, entityState)
				break

			default:
				console.log('hit default case while reading binary')
				break
			
		}
	}
}

module.exports = readBinaryMessageData