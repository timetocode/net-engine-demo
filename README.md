net-engine-demo
===============

An HTML5 + node.js websocket net engine. Game entities are updated on the server, and (almost) automagically synced to all clients. Only partially implemented.


The client-app.js is built with watchify "watchify main.js -o client-app.js"

The jist of the idea is that the developer can define an entity likeso:

```
function Ninja() {
  this.id = 0
  this.x = 25
  this.y = 25
  this.serverSideOnly = 109342
}
```
And then define a binary schema which explains how ninja can be converted into bytes:
```
var ninjaSchema = {
  id: Binary.UInt16,
  x: Binary.UInt16,
  y: Binary.UInt16,
}

Ninja.prototype.schema = ninjaSchema

// then in EntityType.js, add Ninja as a type
```
Ninjas can then be used in the game logic, and experience all types of changes to their state. The server will keep track of the ninjas, and will update all connected clients appropriately. It's not entirely that simple in all examples, but in this case of this hypothetical ninja, it would work just like that.

More documentation to come.


