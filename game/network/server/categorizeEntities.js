/*
* Groups entities into:
*   full: entity requires its full data to be sent
*   partial: entity is known to the client already and *may* need a partial 
*       update
*   unsubscribes: entity ids that are no longer relevant
* @method categorizeEntities
* @param {Array} entities Entities to group
* @param {Array} nearbyIds Array of nearby entity ids, will be compared to past
* @param {EntityState} entityState The past state of all entities, used for 
*   comparison.
* @return {Object} Returns an object wrapping full, partial, and unsubscribes
*/
function categorizeEntities(entities, nearbyIds, entityState) {
    // entities that require a full data to be sent
    var full = []
    // entities that require only their changes to be sent
    var partial = []
    // entities that this client should now forget about
    var unsubscribes = []

    var previousIds = entityState.getAllIds()
    var currIds = []

    for (var i = 0; i < entities.length; i++) {
        currIds.push(entities[i].id)
    }

    // no longer being updated, eligible to be forgotten (unsubscribed)
    var unsubscribes = inFirstArrayButNotInSecondArray(currIds, previousIds)

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i]

        if (typeof entityState.getById(entity.id) !== 'undefined') {
            if (unsubscribes.indexOf(entity.id) === -1) {
                // known to the client, eligible for partial update
                partial.push(entity)
            }
        } else {
            // new to the client, eligible for full update
            full.push(entity)
        }
    }

    //console.log('cats', 'u', unsubscribes.length, 'p', partial.length, 'f', full.length)  
    return { 
        full: full, 
        partial: partial, 
        unsubscribes: unsubscribes 
    }
}

// awkward, but used to determine if an entity used to matter, and is no longer
// being tracked, and therefore is eligible to be unsubscribed
var inFirstArrayButNotInSecondArray = function(first, second) {
    var arr = []
    for (var i = 0; i < second.length; i++) {
        if (first.indexOf(second[i]) === -1) {
            arr.push(second[i])
        }
    }
    return arr
}

module.exports = categorizeEntities