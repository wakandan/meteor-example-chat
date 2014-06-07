/**
 * Chats is the collection of all chat messages. Object has the structure
 * {
 *      roomId: <String>,
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
    });
    Template.messages.roomMessages = function() {
        var roomId = Session.get('room_id');
        return Chats.find({
            roomId: roomId
        }, {
            sort: {
                messages: {
                    timestamp: -1
                }
            }
        })
        // return Chats.find({
        //     roomId: roomId
        // }, {
        //     sort: {
        //         timestamp: -1
        //     }
        // });
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
                roomId = Random.id();
                Chats.insert({
                    roomId: roomId,
                    messages: [{
                        timestamp: new Date(),
                        content: message
                    }]
                })
                roomIdElem.val(roomId);
                Session.set('room_id', roomId);
            } else { //room Id is presented, join the chat room
                var room = Chats.findOne({
                    roomId: roomId
                })
                if (room) {
                    console.log('pushing a new message')
                    Session.set('room_id', roomId);
                    Chats.update({
                        _id: room._id
                    }, {
                        '$push': {
                            messages: {
                                timestamp: new Date(),
                                content: message
                            }
                        }

                    })
                }
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
    });
}