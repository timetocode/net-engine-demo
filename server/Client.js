var AABB = require('../game/AABB')
var EntityState = require('../game/EntityState')

/**
* A connected client, from the server's perspective
*/
function Client(connection) {
	// the position and field of vision
	this.view = new AABB(0, 0, 100, 100)
	// a websocket connection
	this.connection = connection
	// everything the server believes the client to know
	this.entityState = new EntityState()
}

module.exports = Client