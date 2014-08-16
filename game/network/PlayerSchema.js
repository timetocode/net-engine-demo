var Binary = require('./Binary')

/**
* PlayerSchema contains the properties and types that will be synchronized 
* between the server and client. This entity may have other properties on
* both the client and server side implementation, but only these props will
* be synchronized from server to client.
*/
var PlayerSchema = {
    id: Binary.UInt16,
    x: Binary.Int16,
    y: Binary.Int16,
    type: Binary.UInt8
}

module.exports = PlayerSchema