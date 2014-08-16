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