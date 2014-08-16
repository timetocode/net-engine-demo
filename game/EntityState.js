var EntityType = require('./entities/EntityType')
var Player = require('./entities/Player')
var NPC = require('./entities/NPC')

/**
* Holds the states of numerous entities
*/
function EntityState() {
	this.entities = {}
}

EntityState.prototype.save = function(entity) {
	//console.log('EntityState saving', entity.id)
	this.entities[entity.id] = entity
}

/*
* Updates an entity, or creates it if it didn't already exist
*/
EntityState.prototype.update = function(id, prop, value) {
	//console.log('EntityState updating', id, prop, value)
	if (!(id in this.entities))
		this.entities[id] = { id: id }

	// controversial javascript!
	// may want to temporarily cache these objects, and then factory them,
	// using 'new SomeEntity()' instead of assigning the prototype as the 
	// data comes in
	if (prop === 'type') {
		if (value === EntityType.Player) {
			//Object.setPrototypeOf(this.entities[id], Player.prototype)
			this.entities[id].__proto__ = Player.prototype
		}

		if (value === EntityType.NPC) {
			//Object.setPrototypeOf(this.entities[id], Entity.prototype)
			this.entities[id].__proto__ = NPC.prototype
		}
	}
	this.entities[id][prop] = value
}

/*
* Updates an enitity's position via a delta x and delta y
*/
EntityState.prototype.updateWithMovementDelta = function(id, dx, dy) {
	//console.log('EntityState updateWithMovementDelta', id, dx, dy)
	this.entities[id].x += dx
	this.entities[id].y += dy
}

EntityState.prototype.remove = function(id) {
	delete this.entities[id]
}

EntityState.prototype.getById = function(id) {
	return this.entities[id]
}

EntityState.prototype.getAllIds = function() {
	// no longer using Object.keys() because it returns strings like '0', '1'
	var ids = []
	for (var id in this.entities) {
		ids.push(parseInt(id)) // keys need turned back into Integers
	}
	return ids
}

/* returns all entities as an array */
EntityState.prototype.getAll = function() {
	var entitiesArr = []
	for (var id in this.entities) {
		entitiesArr.push(this.entities[id])
	}
	return entitiesArr
}

module.exports = EntityState