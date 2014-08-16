var PlayerSchema = require('../network/PlayerSchema')
var EntityType = require('./EntityType')

function Player(id) {
	this.id = id
	this.x = 250
	this.y = 250
	this.type = EntityType.Player
}

Player.prototype.update = function(delta) {
	// player's serverside update logic could go here, there isn't any atm
}

Player.prototype.schema = PlayerSchema


module.exports = Player