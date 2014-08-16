net-engine-demo
===============

Per request, I'm sharing the core of the network code from a few blog posts on http://timetocode.tumblr.com/. I sometimes referred to this project as the 'mmo prototype,' because it began as an attempt to see how many HTML5 clients could connect to a node.js server via websockets w/ realistic cpu and bandwidth usages. The answer, at the time of writing, was that ~200-400 clients could connect and run an oversimplified RPG on one core of a decent 2012 laptop. The limiting factor was in fact the CPU, and I hypothesize that dividing up the game world and simulation across multiple cores might yield truer mmo player counts in the 800-2k range. In any case, these aforementioned tests were the end of the mmo-prototyping, and subsequent develop based on the prototype has continued with much lighter goals. It is no longer an mmo engine in its core, sorry!

So what _is_ in this net engine?
* basic tick-based game loops, both in-browser via requestAnimationFrame and in node.js via setInterval+setImmediate magicks
* buffered input management on the client side (inputs collected all the time, but sent out once per tick)
* a system where game entities can be rapidly changed or made from scratch without writing much netcode (often none at all)
* a mixin-inspired coding pattern that can fully separate clientside and serverside code (see: NPC.update.js and NPC.draw.js for an example of seperate), conversely the client and server can share the exact same implementations (see: EntityState.js for a class used identically in both server and client)
* micro-optimiziation of movement data for entities (4 bytes, id, delta X, delta Y)

What _isn't_ in this code, but _was_ mentioned in 'mmo-prototype' blog posts?
* entity interpolation
* clientside prediction
* lag compensation
* methods of throttling bandwidth in player-crowded areas
* quadtrees
* all content, including: artwork, procedurally generated terrain, procedurally generated characters, gameplay, AI

Now I know some of these items on the above list are big ones for people! Please keep in mind that my motive for releasing this code is to help aspiring game programmers, not to furnish anyone with a fully functional game nor even game engine. That said, I've collected a set of snippets from the old prototype that show some of the implementations for the above.
* interpolation: https://gist.github.com/timetocode/11235041
* lag compensation of ping and variable tickrates(throttling) for an aoe attack: https://gist.github.com/timetocode/6792468
* lag compensation pseudo code and writeup: http://timetocode.tumblr.com/post/62053196114/lag-compensation-attempt
* note: throttling in the mmoprototype consisted of changing the tickrate for a player, sending data from the server less frequently, and accounting for this new tickrate in the interp code to make everything smooth
* quadtree demo and source code: http://jsfiddle.net/FWKV9/embedded/result/ (click edit in the top right for code, lines 65-198)
* more details about the included serverside gameloop: http://timetocode.tumblr.com/post/71512510386/an-accurate-node-js-game-loop-inbetween-settimeout-and
* procedural island generator: https://github.com/timetocode/volcanic-island-generator
* early version of the lumberjack ai: http://jsfiddle.net/9QR3U/3/embedded/result/


How to run the demo:
* make sure node & npm are installed
* run npm install from /server (this will install the websocket lib)
* run node server.js from /server
* open browser and connect to localhost:8080

The client-app.js is built with watchify from /client "watchify main.js -o client-app.js -v"

The jist of the idea of the automagic server -> client syncing idea is to define a game entity like this:

```javascript
function Ninja() {
  this.id = 0
  this.type = EntityType.Ninja
  this.x = 25
  this.y = 25
  this.serverSideOnly = 109342
}
```
And then define a binary schema which explains how ninja can be converted into bytes:
```javascript
var ninjaSchema = {
  id: Binary.UInt16,
  type: Binary.UInt8
  x: Binary.Int16,
  y: Binary.Int16,
}

Ninja.prototype.schema = ninjaSchema

// then in EntityType.js, add Ninja as a type
```
Ninjas can then be used in the game logic, and experience all types of changes to their state. The server will keep track of the ninjas, and will update all connected clients appropriately. It's not entirely that simple in all examples, but in the case of this hypothetical ninja, it would work just like that. In more complicated cases entity properties need their names added in Prop.js. There is no binary string type, but it could easily be added. There are also no types smaller than one byte such as a boolean... but packing it into an Int8 will still transmit the data.

A mixin style pattern can be used to attach server or client specific logic to entities. For example, the NPC entity on its own is a simple object. On the clientside the NPC.draw function gets mixed in, and on the serverside the NPC.update function gets mixed in. The node.js server has no knowledge of NPC.draw, and (more importantly) watchify will not build NPC.update into the clientside javascript package because it is never required from any client code. This offers a relatively pleasant organization for the codebase while still offering an option to keep severside implementation details secret. Of course, code which is intentionally shared on both server and client will end up visible on the client.

