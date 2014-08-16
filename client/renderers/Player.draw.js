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
