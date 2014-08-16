
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

