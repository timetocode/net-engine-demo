var config = require('../game/config')

/**
* Updates @ 20 fps (change w/ config.UPDATE_RATE)
*
* @object ServerEngine
*/
var ServerEngine = {}
ServerEngine.previousTick = Date.now()
ServerEngine.UPDATE_RATE = config.UPDATE_RATE
ServerEngine.tick = 0

ServerEngine.updateables = [] 

ServerEngine.loop = function() {
  var now = Date.now()
  if (ServerEngine.previousTick + 1000 / ServerEngine.UPDATE_RATE <= now) {
    var delta = (now - ServerEngine.previousTick) / 1000
    ServerEngine.previousTick = now
    ServerEngine.tick++


    if (delta * 1000 > 1000 / ServerEngine.UPDATE_RATE)
      console.log('lagged by', (delta * 1000) - (1000 / ServerEngine.UPDATE_RATE), 'ms')
    // update
    ServerEngine.update(delta)
  }


  if (Date.now() - ServerEngine.previousTick < 1000 / ServerEngine.UPDATE_RATE - 16) {
    // if more than 16 ms until next update, use setTimeout to
    // schedule the next iteration (which can take up to 16 ms)
    setTimeout(ServerEngine.loop)
  } else {
    // if less than 16 ms until next update, use setTimeout
    // which runs ASAP
    setImmediate(ServerEngine.loop)
  }
}

ServerEngine.update = function(delta) {
  //console.log('update called', delta)

  //var start = Date.now()
  for (var i = 0; i < ServerEngine.updateables.length; i++) {
    ServerEngine.updateables[i].update(delta)
  }

  //var stop = Date.now()
  //console.log('update complete in', stop-start, 'ms')
}

module.exports = ServerEngine