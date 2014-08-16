/*
* Represents binary types
* Tracks functions used on the client (html5 websocket implementation) for 
* writing binary data. Denoted with clWriteFn or clReadFn (cl = client)
* Tracks functions used on the server (node.js buffers) for writing binary data.
* Denoted with svWriteFn and svReadFn (sv = server)
* Altogether used to define binary schemas of game entities
*/
var Binary = {}

Binary.Int8 = {
    min: -128,
    max: 127,
    bytes: 1,
    svWriteFn: 'writeInt8',
    svReadFn: 'readInt8',
    clWriteFn: 'setInt8',
    clReadFn: 'getInt8'
}

Binary.UInt8 = {
    min: 0,
    max: 255,
    bytes: 1,
    svWriteFn: 'writeUInt8',
    svReadFn: 'readUInt8',
    clWriteFn: 'setUint8',
    clReadFn: 'getUint8'
}

Binary.Int16 = {
    min: -32768,
    max: 32767,
    bytes: 2,
    svWriteFn: 'writeInt16LE',
    svReadFn: 'readInt16LE',
    clWriteFn: 'setInt16',
    clReadFn: 'getInt16'
}

Binary.UInt16 = {
    min: 0,
    max: 65535,
    bytes: 2,
    svWriteFn: 'writeUInt16LE',
    svReadFn: 'readUInt16LE',
    clWriteFn: 'setUint16',
    clReadFn: 'getUint16'
}

// ## untested/unused so far
Binary.Int32 = {
    min: -2147483648,
    max: 2147483647,
    bytes: 4,
    svWriteFn: 'writeInt32LE',
    svReadFn: 'readInt32LE',
    clWriteFn: 'setInt32',
    clReadFn: 'getInt32'
}

// ## untested/unused so far
Binary.UInt32 = {
    min: 0,
    max: 4294967295,
    bytes: 4,
    svWriteFn: 'writeUInt32LE',
    svReadFn: 'readUInt32LE',
    clWriteFn: 'setUint32',
    clReadFn: 'getUint32'
}


module.exports = Binary