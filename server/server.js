var WebSocketServer = require('websocket').server
var http = require('http')
var StaticHTMLHandler = require('./StaticHTMLHandler')

var Client = require('./Client')
var GameState = require('../game/GameState')
var ServerEngine = require('./ServerEngine')
var config = require('../game/config')
var assembleSnapshot = require('../game/network/server/assembleSnapshot')

// start an HTML server
var server = http.createServer(function(req, res) {
    console.log((new Date()) + ' Received request for ' + req.url);
    StaticHTMLHandler.listen(req, res)
})

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080')
})

// start the websocket server
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})


// the extent of state for the server in this demo
var clients = []
var gameState = new GameState()
gameState.init()


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject()
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
      return
    }

    var connection = request.accept(config.PROTOCOL, request.origin)


    var client = new Client(connection)
    client.id = clients.length
    client.player = gameState.newPlayer()
    clients.push(client)

    console.log((new Date()) + ' Connection accepted. Clients connected: ' + clients.length)

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data)
            connection.sendUTF(message.utf8Data)
        }
        else if (message.type === 'binary') {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
            //connection.sendBytes(message.binaryData)

            // This is the only thing the client sends to the server! x,y of
            //   the mouse cursor, which we treat as its position.
            client.view.x = message.binaryData.readUInt16LE(0)
            client.view.y = message.binaryData.readUInt16LE(2)
            client.player.x = client.view.x
            client.player.y = client.view.y
        }
    })
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
        
        clients.splice(client.id, 1)
    })
})




ServerEngine.updateables.push({ 
    update: function(delta) {
        gameState.update(delta)

        for (var i = 0; i < clients.length; i++) {
            var client = clients[i]
            
            // get entities within this client's view
            var viewableEntities = gameState.getEntitiesWithinArea(client.view)
            
            var buffer = assembleSnapshot(
                viewableEntities, 
                client.entityState
            )            

            if (buffer)
                client.connection.sendBytes(buffer)  
        }   
    }
})

// begin the server loop
ServerEngine.loop()

