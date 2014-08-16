// axis-aligned bounding box
/* PARAMS: (Point)center, (Point)half */
function AABB(x, y, halfWidth, halfHeight) {
	this.x = x
	this.y = y
	this.halfWidth = halfWidth
	this.halfHeight = halfHeight
}


AABB.prototype.containsPoint = function(x, y) {
	// inclusive on the lower bound, exclusivive on the upper bound
	// otherwise a point exactly on a line can be part of two nodes
	return (x >= this.x - this.halfWidth 
		&& y >= this.y - this.halfHeight
		&& x < this.x + this.halfWidth
		&& y < this.y + this.halfHeight)
}

AABB.prototype.intersects = function(aabb) {
	return (Math.abs(this.x - aabb.x) * 2 < (this.halfWidth  * 2 + aabb.halfWidth  * 2))
		&& (Math.abs(this.y - aabb.y) * 2 < (this.halfHeight * 2 + aabb.halfHeight * 2))
}

module.exports = AABB