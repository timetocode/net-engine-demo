var Binary = require('./Binary')

/**
* NPCSchema contains the properties and types that will be synchronized 
* between the server and client. This entity may have other properties on
* both the client and server side implementation, but only these props will
* be synchronized from server to client.
*/
var NPCSchema = {
    id: Binary.UInt16,
    x: Binary.Int16,
    y: Binary.Int16,
    radius: Binary.UInt16,
    speed: Binary.UInt8,
    r: Binary.UInt8,
    g: Binary.UInt8,
    b: Binary.UInt8,
    type: Binary.UInt8
}

module.exports = NPCSchema