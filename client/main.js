
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
