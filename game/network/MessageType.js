/*
* MessageType enum
* The integer also becomes the net representation of the MessageType and must be
* limited to one signed byte (0-255).
*/
module.exports = {
	MiscProperties: 0,
	Unsubscribes: 1,
	CompactMovements: 2,
	FullEntities: 3
}