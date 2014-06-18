/**
 * Chats is the collection of all chat messages. Object has the structure
 * {
 *      roomName: <String>,
 *      messages: [{
            timestamp: Date,
            content: String
        }]
 * }
 */
Chats = new Meteor.Collection('chats');
if (Meteor.isClient) {
    Meteor.startup(function() {
        Session.set('room_id', null)
        Meteor.autorun(function() {
            Meteor.subscribe('room-messages', Session.get('room_id'));
            Meteor.subscribe('room-ids');
        });
    });
    Template.messages.roomMessages = function() {
        return Chats.find({_id: Session.get('room_id')})
    }
    Template.rooms.rooms = function(){
        return Chats.find({}, {messages: -1});
    }
    Template.form.events({
        'click #submit': function(evt) {
            console.log(evt);
            console.log('submit button clicked')
            var roomIdElem = $('#room_id');
            var roomId = roomIdElem.val();
            var msgElem = $('#msg_content');
            var message = msgElem.val();
            if (!message) {
                console.log("Empty message, abort...");
                return;
            }
            //room id is null, then create a new room 
            if (!roomId) {
                console.log("Room id is null, create a new room")                
                var newRoom = Chats.insert({                    
                    messages: [{
                        timestamp: new Date(),
                        content: message
                    }]
                })
                console.log(newRoom);
                roomIdElem.val(newRoom);
                Session.set('room_id', newRoom);
            } else { //room Id is presented, join the chat room
                console.log('pushing a new message')
                Session.set('room_id', roomId);
                Chats.update({
                    _id : roomId
                }, {
                    '$push': {
                        messages: {
                            timestamp: new Date(),
                            content: message
                        }
                    }

                })
            }
            //clear the chat box
            msgElem.val('')
            msgElem.focus();
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
        Meteor.publish("room-messages", function(roomId) {
            if (!roomId) {
                return null;
            } else {
                return Chats.find({
                    _id: roomId
                })
            }
        });
        Meteor.publish("room-ids", function(){            
            return Chats.find({}, {messages: -1});
        });
    });
}