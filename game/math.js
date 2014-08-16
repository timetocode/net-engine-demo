

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
