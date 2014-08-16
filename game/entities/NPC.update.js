var math = require('../math')

/*
* The behavior of 'NPC.' Which in this case is basically an undulating circle
*   that slowly grows or shrinks, changes color randomly, and bounces around
*   within a rectangle
*/
module.exports = function() {
	this.update = function(delta) {

		// continue moving in the direction of xm, ym
		this.x += this.speed * delta * this.xm
		this.y += this.speed * delta * this.ym

		// randomly change color, probability: 1% chance each game tick
		if (math.random(0,99) === 5) {
			//console.log('RANDOM COLOR CHANGE')
			this.r = math.random(50, 255)
			this.g = math.random(50, 255)
			this.b = math.random(50, 255)			
		}

		// change direction after hitting a edge
		if (this.x > 460) {
			this.xm *= -1
		}
		if (this.x < 40) {
			this.xm *= -1
		}

		if (this.y > 460) {
			this.ym *= -1
		}
		if (this.y < 40) {
			this.ym *= -1
		}


		// grow or shrink
		if (this.isGrowing)
			this.radius++
		else
			this.radius--

		// if too big, begin shrinking
		if (this.radius > 40) {
			this.isGrowing = false
		}

		// if too small, begin growing
		if (this.radius < 20) {
			this.isGrowing = true
		}
	}
}

