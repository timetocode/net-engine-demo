
var NPC = require('./entities/NPC')
var Player = require('./entities/Player')
var EntityState = require('./EntityState')

// attach the NPC.update function to NPC
require('./entities/NPC.update').call(NPC.prototype)

function GameState() {
	//this.entities = []
	this.entityState = new EntityState()
	this.currEntityId = 0
}

GameState.prototype.init = function() {

	for (var i = 0; i < 30; i++) {
		var ent = new NPC()
		ent.id = this.currEntityId
		ent.name = 'bot' + i

		this.currEntityId++

		this.entityState.save(ent)
		//this.entities.push(ent)
	}

	console.log('entities generated')

}

GameState.prototype.newPlayer = function() {
	var player = new Player(this.currEntityId)
	//this.entities.push(player)
	this.entityState.save(player)
	this.currEntityId++
	return player 
}

GameState.prototype.update = function(delta) {
	var entities = this.entityState.getAll()
	for (var i = 0; i < entities.length; i++) {
		entities[i].update(delta)
	}
}

GameState.prototype.getEntitiesWithinArea = function(area) {
	var entitiesInArea = []

	// this is where some quadtree logic could go instead of brute force!
	var entities = this.entityState.getAll()
	for (var k = 0; k < entities.length; k++) {
		var entity = entities[k]
		if (area.containsPoint(entity.x, entity.y)) {
	    	entitiesInArea.push(entity)
		}
	}

    return entitiesInArea
}

module.exports = GameState