(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var config = require('../game/config')

/**
* Renders @ 60 fps (as specified by requestAnimationFrame)
*      draws the grid
*      draws the entities
*
* Updates @ 20 fps (change w/ UPDATE_RATE)
*      collects inputs
*      sends inputs to server
*
* @object ClientEngine
*/
var ClientEngine = {}
ClientEngine.previousUpdateTick = Date.now()
ClientEngine.UPDATE_RATE = config.UPDATE_RATE
ClientEngine.tick = 0
ClientEngine.drawables = []
ClientEngine.updateables = []

/**
* Begins updating and drawing
*/
ClientEngine.begin = function() {
	window.requestAnimationFrame(ClientEngine.loop)
}


/**
* infinite loop!
* calls update at UPDATE_RATE times per second
* calls draw at whatever speed requestAnimationFrame runs
*  which, by specification, is 60 fps while the browser has focus
*  and less (30fps? 10fps? 0fps?) if the brower's tab is in the background
*/
ClientEngine.loop = function() {
	var now = Date.now()
	if (ClientEngine.previousUpdateTick + 1000 / ClientEngine.UPDATE_RATE <= now) {
		var delta = (now - ClientEngine.previousUpdateTick) / 1000
		ClientEngine.previousUpdateTick = now
		ClientEngine.tick++
		//console.log('Client Engine Tick', ClientEngine.tick, delta)
		ClientEngine.update(delta)
	}
	ClientEngine.draw()
	window.requestAnimationFrame(ClientEngine.loop)
}


ClientEngine.update = function(delta) {
	// update logic
	for (var i = 0; i < ClientEngine.updateables.length; i++) {
		ClientEngine.updateables[i].update(delta)
	}

}

ClientEngine.draw = function(context) {
	//console.log('draw')
	for (var i = 0; i < ClientEngine.drawables.length; i++) {
		ClientEngine.drawables[i].draw(context)
	}
}

module.exports = ClientEngine
},{"../game/config":8}],2:[function(require,module,exports){
// NOTE: all keystroke stuff has been removed from this class
//  it is MOUSE ONLY for this demo
/**
* Stores keystrokes for any given tick of the client engine
* During any given tick, a key is counted as either havng been 
* pressed for the entire tick, or not pressed at all -- there is 
* no such thing as pressing a key for a portion of a tick. This
* allows for a deterministic simulation.
* @class InputManager
* @constructor
*/
function InputManager() {
  this.buffer = {} 
  // current tick # of the client engine
  this.currentTick = 0 
  // mouse position
  this.mx = 0
  this.my = 0
}


/**
* Creates a new tick for the InputManager
* All keystrokes are set to false for this tick, unless
* the key is still being held down
* @method update
* @param {Integer} tick A tick number from the client engine
*/
InputManager.prototype.update = function(tick) {
  this.currentTick = tick
  // TODO: set any key states to their default state
}

/**
* Returns the inputs for any given tick
* @method getInput
* @param {Integer} tick
*/
InputManager.prototype.getInput = function(tick) {
  return this.buffer[tick]
}

/**
* Deletes the inputs for any given tick, for example after they've been confirmed
* by the server
* @method deleteInput
* @param {Integer} tick
*/
InputManager.prototype.deleteInput = function(tick) {
  delete this.buffer[tick]
}

/**
* Begins listening for W A S D keystrokes
* @method beginCapture
* @param {DOMElement} canvas The canvas or DOMElement which will listen for keystrokes
*/
InputManager.prototype.beginCapture = function(canvas) {
  var self = this


  document.addEventListener('mousemove', function(e) {
    // mouse relative position code from stackoverflow
    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    // answer by Ryan Artecona
    var totalOffsetX = 0
    var totalOffsetY = 0
    var canvasX = 0
    var canvasY = 0
    var currentElement = canvas

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX
    canvasY = event.pageY - totalOffsetY

    self.mx = canvasX
    self.my = canvasY


    // limit values to being within the canvas
    // note: self might not matter if the canvas were the same size as the window
    // because self event can only fire while within the window
    if (self.mx < 0)
      self.mx = 0

    if (self.my < 0)
      self.my = 0

    if (self.mx > canvas.width)
      self.mx = canvas.width

    if (self.my > canvas.width)
      self.my = canvas.width
  })

  // EXPANDABLE: could listen for other keys or mouse actions
}

module.exports = InputManager

},{}],3:[function(require,module,exports){

require('./rAF.js')
var ClientEngine = require('./ClientEngine')
var InputManager = require('./InputManager')
var MessageType = require('../game/network/MessageType')
var EntityState = require('../game/EntityState')
var readBinaryMessageData = require('../game/network/client/readBinaryMessageData')
var config = require('../game/config')

var NPC = require('../game/entities/NPC')
var Player = require('../game/entities/Player')
require('./renderers/NPC.draw').call(NPC.prototype)
require('./renderers/Player.draw').call(Player.prototype)

/*
* window.onload is executed when the webpage content has finished loading
*/
window.onload = function() {
	console.log('window loaded')

	var canvas = document.getElementById('canvas')
	var context = canvas.getContext('2d')

	// handles mouse movements
	var inputManager = new InputManager()
	inputManager.beginCapture(canvas)

	// this is the object where all of the client's game-related state is stored
	var entityState = new EntityState()


	// the draw function to be run @ 60fps
	// renders entities (NPCs, Player)
	// draws a box around the player's view
	ClientEngine.drawables.push({ draw: function() {
		canvas.width = canvas.width

		// draw the entities
		var entities = entityState.getAll()
		for (var id in entities) {
			var entity = entities[id]
			entity.draw(context)
		}

		// draw the view box
		context.beginPath()
		context.rect(inputManager.mx - 100, inputManager.my - 100, 200, 200)
		context.strokeStyle = 'black'
		context.stroke()
		context.closePath()
	}})

	// the update logic to be run @ 20fps
	// sends mouse position to server
	ClientEngine.updateables.push({ update: function() {
		var buffer = new ArrayBuffer(4)
		var dataView = new DataView(buffer)
		dataView.setUint16(0, inputManager.mx, true)
		dataView.setUint16(2, inputManager.my, true)
		ws.send(buffer)
	}})

	// setup websocket connection
	var ws = new WebSocket('ws://127.0.0.1:8080', config.PROTOCOL)
	ws.binaryType = 'arraybuffer'

	ws.onopen = function() {
		console.log('WebSocket connection open')
		ClientEngine.begin()
	}

	ws.onerror = function(err) {
		console.log('WebSocket error', err)
	}

	ws.onmessage = function(message) {
		if (message.data instanceof ArrayBuffer) {
			readBinaryMessageData(message.data, entityState)	
		} else if (typeof message.data === 'string') {
			console.log('json, ignoring')
		} else {
			console.log('unknown websocket data type')
		}
	}
}

},{"../game/EntityState":7,"../game/config":8,"../game/entities/NPC":10,"../game/entities/Player":11,"../game/network/MessageType":14,"../game/network/client/readBinaryMessageData":18,"./ClientEngine":1,"./InputManager":2,"./rAF.js":4,"./renderers/NPC.draw":5,"./renderers/Player.draw":6}],4:[function(require,module,exports){
/*
* rAF.js -- a shim to add compatability for window.requestAnimationFrame
* credits: https://gist.github.com/paulirish/1579671
* Erik Moller, Paul Irish, Tino Zijdel
*/
module.exports = (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
},{}],5:[function(require,module,exports){

/*
* Draw function for NPC
*/
module.exports = function() {
	this.draw = function(context) {
		// draw an appropriately sized and colored circle
		context.beginPath()
		context.fillStyle = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b +', 1.0)'
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
		context.fill()	

		// draw the entity number in the center
      	context.font = '32px Arial Bold'
		context.fillStyle = 'white'
		if (this.id < 10) {
			// roughly centerinng one digit numbers
			context.fillText(this.id, this.x - 9, this.y + 11)
		} else {
			// roughly centering two digit numbers
			context.fillText(this.id, this.x - 19, this.y + 11)
		}
		context.closePath()
	}
}


},{}],6:[function(require,module,exports){
/*
* Draw function for Player
*/
module.exports = function() {
	this.draw = function(context) {
		// draw a red circle
		context.beginPath()
		context.fillStyle = 'red'
		context.arc(this.x, this.y, 30, 0, 2 * Math.PI, false)
		context.fill()	

		// draw the player id in black
      	context.font = '32px Arial Bold'
		context.fillStyle = 'black'
		if (this.id < 10)
			context.fillText(this.id, this.x - 9, this.y + 11)
		else
			context.fillText(this.id, this.x - 19, this.y + 11)

		context.closePath()

	}
}

},{}],7:[function(require,module,exports){
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
},{"./entities/EntityType":9,"./entities/NPC":10,"./entities/Player":11}],8:[function(require,module,exports){
/**
* Configuration variables shared between server and client
*/
module.exports = {
	UPDATE_RATE: 20, // the tick rate of the game simulation

	PROTOCOL: 'hello-world-protocol', // just a custom protocol name for the 
	                                  //   websocket connection

	version: 123456789.0 // not used
}
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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


},{"../math":12,"../network/NPCSchema":15,"./EntityType":9}],11:[function(require,module,exports){
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
},{"../network/PlayerSchema":16,"./EntityType":9}],12:[function(require,module,exports){


var normalizeVector = function(x, y) {

  // edge case: 0
  if (x === 0 && y === 0)
    return { x: 0, y: 0 }

  var length;
  length = Math.sqrt((x * x) + (y * y))
  return {
    x: x / length,
    y: y / length
  }
}

var substractVector = function(x0, y0, x1, x0) {
  
}

var lerp = function(a, b, amount) {
  return a + ((b - a) * amount)
};

var randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
};

var scaleToRange = function (min, max, a, b, x) {
  return (b - a) * (x - min) / (max - min) + a
}

var rangeToColor = function(n) {
  if (n > 225) {
    return '#e5e5e5'  // off white
  } else if ( n > 185) {
    return '#c3c1bb'  // light grey
  } else if ( n > 170) {
    return '#9b9993'  // medium grey
  } else if ( n > 155) {
    return '#766e74'  // dark grey
  } else if ( n > 150) {
    return '#415811'  // pine
  } else if ( n > 140) {
    return '#637e29'  // medium green
  } else if ( n > 135) {
    return '#8ca653'  // light green
  } else if ( n > 130) {
    return '#dcd9b4'  // sand
  } else if ( n > 120) {
    return '#90bfbb'  // light blue
  } else if ( n > 110) {
    return '#7baac8'  // medium blue
  } else {
    return '#1e6ea0'  // dark blue
  }
  return '#ff45da'  // hot pink
}

exports.rangeToColor = rangeToColor

exports.scaleToRange = scaleToRange

exports.normalizeVector = normalizeVector

exports.lerp = lerp

exports.random = randomInt

},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
var Binary = require('./Binary')

/**
* NPCSchema contains the properties and types that will be synchronized 
*   between the server and client. This entity may have other properties on
*   both the client and server side implementation, but only these props will
*   be synchronized from server to client.
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
},{"./Binary":13}],16:[function(require,module,exports){
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
},{"./Binary":13}],17:[function(require,module,exports){
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

},{"./Binary":13}],18:[function(require,module,exports){
var MessageType = require('../MessageType')
var readMovementDeltas = require('./readMovementDeltas')
var readUnsubscribes = require('./readUnsubscribes')
var readChangedProps = require('./readChangedProps')
var readFullEntities = require('./readFullEntities')

/**
* Reads binary messages, looks for the MessageType flag and calls the
*  appropriate reader. See /game/network/client/ for readers
* @method readBinaryMessageData
* @param {Object} data The binary data property of a websocket message
* @param {EntityState} entityState The entityState where data will be recorded
*/
function readBinaryMessageData(data, entityState) {
	var dataView = new DataView(data)
	var offset = 0
	
	while (offset < dataView.byteLength) {
		var msgType = dataView.getUint8(offset, true)
		offset += 1
		//console.log(msgType)
		switch (msgType) {
			case MessageType.Unsubscribes:
				//console.log('Unsubscribes')
				offset = readUnsubscribes(dataView, offset, entityState)
				break
			case MessageType.CompactMovements:
				//console.log('CompactMovements')
				offset = readMovementDeltas(dataView, offset, entityState)				
				break
			case MessageType.FullEntities:
				//console.log('FullEntities')
				offset = readFullEntities(dataView, offset, entityState)
				break
			case MessageType.MiscProperties:
				//console.log('MiscProperties')
				offset = readChangedProps(dataView, offset, entityState)
				break

			default:
				console.log('hit default case while reading binary')
				break
			
		}
	}
}

module.exports = readBinaryMessageData
},{"../MessageType":14,"./readChangedProps":19,"./readFullEntities":20,"./readMovementDeltas":21,"./readUnsubscribes":22}],19:[function(require,module,exports){
var Prop = require('../Prop')

/**
* Reads prop names and values, and updates entityState accordingly. Dynamically
*  chooses dataView reading functions depending on the EntitySchema. This is the
*  most black magicky function of this demo.
* @method readChangedProps
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readChangedProps(dataView, offset, entityState) {
	var id = -1
	var entity = false

	/* The server will send an entity id followed by any number of prop names 
	*    and values! For example it could send: id: 1, x: 200, radius: 34, r: 2,
	*    g: 30, b: 30, or id: 20, hellokitty: -219308. It could really be 
	*    anything. Because we don't know how many prop names and values might 
	*    follow the id, we keep reading until we hit another prop named 'id.' 
	*    The id will always come first, and we'll only receive misc props from
	*    entities that the client has already received in full in some point in
	*    the past. Because of these rules, we can load the entity from 
	*    entityState after we read the id, and then refer to the entity's schema
	*    to know how many bytes to read from the buffer per propName. The 
	*    propName itself is always 1 byte. We can continue reading misc props
	*    about misc entities until we hit the end of the buffer.
	*/

	// read to the end of the buffer
	while (offset < dataView.byteLength) {
		// assume the first byte of data represents a property (id, x, y, etc)
		var propCode = dataView.getUint8(offset, true)
		offset += 1
		//console.log('prop', Prop.getName(propCode))
		// translate the property from its code back to its name (0 -> id)
		var prop = Prop.getName(propCode)
		if (prop === 'id') {
			// if the prop is id, then fetch the known entity
			id = dataView.getUint16(offset, true)
			offset += 2
			entity = entityState.getById(id)
		} else {
			//console.log(entity, 'prop', prop, 'sc', entity.schema[prop])
			// if the prop isn't id, assume
			if (entity) {
				var value = dataView[entity.schema[prop].clReadFn](offset, true)
				offset += entity.schema[prop].bytes
				entityState.update(id, prop, value)
			}
		}		
	}
	return offset						
}

module.exports = readChangedProps
},{"../Prop":17}],20:[function(require,module,exports){
var Prop = require('../Prop')

/**
* Reads full entities from the buffer. The entity id and type are always sent
* first, and calling entityState.update on these values will create the correct
* type of entity (e.g. an instance of NPC, or whatever). From the instance, we
* can read the schema, and the schema will specify how many bytes to read at a
* time and which properties to expect in the buffer.
* @method readFullEntities
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readFullEntities(dataView, offset, entityState) {

	var length = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < length; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2

		var type = dataView.getUint8(offset, true)
		offset += 1

		entityState.update(id, 'type', type)

		var entity = entityState.getById(id)

		for (var prop in entity.schema) {
		    if (prop !== 'id' && prop !== 'type') {
		        var value = dataView[entity.schema[prop].clReadFn](offset, true)
		        offset += entity.schema[prop].bytes

		        entityState.update(id, prop, value)
		    }
		}
	}
	return offset
}

module.exports = readFullEntities
},{"../Prop":17}],21:[function(require,module,exports){
/**
* Reads movement updates and applies them via entityState
* @method readMovementDeltas
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readMovementDeltas(dataView, offset, entityState) {
	var length = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < length; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2
		var dx = dataView.getInt8(offset)
		offset += 1
		var dy = dataView.getInt8(offset)
		offset += 1

		entityState.updateWithMovementDelta(id, dx, dy)
	}
	return offset
}

module.exports = readMovementDeltas
},{}],22:[function(require,module,exports){
/**
* Reads unsubscribe ids and removes them from entityState
* @method readChangedProps
* @param {DataView} dataView The dataView to read data from
* @param {Integer} offset The offset at which to begin reading
* @param {EntityState} entityState The entityState to record the new values
* @return {Integer} Returns the new offset
*/
function readUnsubscribes(dataView, offset, entityState) {
	var unsubscribeLength = dataView.getUint16(offset, true)
	offset += 2

	for (var i = 0; i < unsubscribeLength; i++) {
		var id = dataView.getUint16(offset, true)
		offset += 2
		entityState.remove(id)
	}
	return offset
}

module.exports = readUnsubscribes
},{}]},{},[3])