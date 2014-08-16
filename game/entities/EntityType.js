/*
* enum of EntityTypes
* these numbers are also the binary representation of the entity when sent from
* the server, and must be limited to one usigned byte (0-255)
* Any new entities added to teh code should be added here as well
*/
var EntityType = {
	Player: 0,
	NPC: 1
}

module.exports = EntityType