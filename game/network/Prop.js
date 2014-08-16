var Binary = require('./Binary')
/**
* Representation of entity property names as numbers from 0-255, or more 
* realistically much less than 255, because 255 is a lot! If more than 255
* properties are needed, then their network representation will need to be
* changed, probably to 2 bytes instead of 1 byte
*/
var Prop = {}
Prop.binaryType = Binary.UInt8

// Any and all props that can be transmitted between server and client.
// Any props (for new entities, for example) that need to be transmittable via
// the writeChangedProps code will need to be added here. Limit: 255 propNames
var propNames = [ 'id', 'x', 'y', 'speed', 'r', 'g', 'b', 'radius', 'type']

if (propNames.length > 255) {
    throw('> 255 propNames! Props must be codifiable within 1 byte')
}

// initialize bidirectional lookups for props by code or by name
Prop.byName = {}
Prop.byCode = {}
for (var i = 0; i < propNames.length; i++) {
    Prop.byName[propNames[i]] = i
    Prop.byCode[i] = propNames[i]
}

Prop.getCode = function(name) {
    return Prop.byName[name]
}

Prop.getName = function(code) {
    return Prop.byCode[code]
}

module.exports = Prop
