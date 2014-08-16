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
