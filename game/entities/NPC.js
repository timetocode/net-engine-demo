var math = require('../math')
var NPCSchema = require('../network/NPCSchema')
var EntityType = require('./EntityType')

/*
* Represents an NPC, or ai-controlled entity. In this demo these entities are
*   undulating circles that randomly change color, and travel along a random
*   trajectory until they hit the edge of an imaginary stage, at which point 
*   they change direction
*/
function NPC() {
	this.id = 0
	this.x = 250
	this.y = 250
	this.type = EntityType.NPC
	var randomMovementVector = { 
		x: math.random(-100, 100), 
		y: math.random(-100, 100) 
	}
	var unitVector = math.normalizeVector(randomMovementVector.x, 
		randomMovementVector.y)
	this.xm = unitVector.x
	this.ym = unitVector.y
	this.isGrowing = true
	this.radius = math.random(20, 40)
	this.speed = math.random(55, 150)
	this.r = math.random(50, 255)
	this.g = math.random(50, 255)
	this.b = math.random(50, 255)
	this.name = 'unnamed entity'
}

NPC.prototype.schema = NPCSchema

module.exports = NPC

