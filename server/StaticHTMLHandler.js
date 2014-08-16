var fs = require('fs')
var path = require('path')

/**
* barebones http functionality that responds to
* '/' and '/client-app.js'
* included only to avoid dependencies on express
*/
module.exports.listen = function(req, res) {
    if (req.url === '/') {
    	// for '/' serve /client/index.html
		fs.readFile(path.join(__dirname, '../client/index.html'), function (err, data) {
			res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length })
			res.write(data)
			res.end()
		})
	} else if (req.url === '/client-app.js') {
		// for '/client-app.js' serve /client/client-app.js
		fs.readFile(path.join(__dirname, '../client/client-app.js'), function (err, data) {
			res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length })
			res.write(data)
			res.end()
		})
    } else {
    	// for everything else, 404 Not Found
   		res.writeHead(404)
    	res.end()
    } 
}