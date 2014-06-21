/**
 * Chats is the collection of all chat messages. Object has the structure
 * {
 *      roomName: <String>,
 *      owner: <String>,
 *      messages: [{
            timestamp: Date,
            content: String
        }]
 * }
 */
Chats = new Meteor.Collection('chats');
if (Meteor.isClient) {
    ////////// Helpers for in-place editing //////////

    // Returns an event map that handles the "escape" and "return" keys and
    // "blur" events on a text input (given by selector) and interprets them
    // as "ok" or "cancel".
    var okCancelEvents = function(selector, callbacks) {
        var ok = callbacks.ok || function() {};
        var cancel = callbacks.cancel || function() {};

        var events = {};
        events['keyup ' + selector + ', keydown ' + selector + ', focusout ' + selector] =
            function(evt) {
                if ((evt.type === "keydown" || evt.type==='keyup') && evt.which === 27) {
                    console.log("cancel pressed")
                    // escape = cancel
                    cancel.call(this, evt);

                } else if (evt.type === "keyup" && evt.which === 13 ||
                    evt.type === "focusout") {
                    // blur/return/enter = ok/submit if non-empty
                    var value = String(evt.target.value || "");
                    if (value)
                        ok.call(this, value, evt);
                    else
                        cancel.call(this, evt);
                }
        };

        return events;
    };
    Meteor.startup(function() {
        Session.set('room_id', null)
        Meteor.autorun(function() {
            Meteor.subscribe('room-messages', Session.get('room_id'));
            Meteor.subscribe('room-ids');
        });
    });
    Template.messages.roomMessages = function() {
        return Chats.find({
            _id: Session.get('room_id')
        })
    }
    Template.rooms.rooms = function() {
        return Chats.find({}, {
            messages: -1
        });
    }    
    Template.rooms.events({
        'click .room_removal': function(evt) {
            console.log("Room removal clicked, id " + evt.target.value);
            var roomId = evt.target.value;
            Chats.remove({
                _id: roomId
            })
        },
    });
    Template.form.events(okCancelEvents('#msg_content', 
    {
        ok: function(evt){
            //user enters the message, insert to db
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
                    _id: roomId
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
        }, 
        cancel: function(evt){
            //users cancel the message, clear the input
            $('#msg_content').val('');
            $('#msg_content').focus();
        }
    }))
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
                    _id: roomId
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
        Meteor.publish("room-ids", function() {
            return Chats.find({}, {
                messages: -1
            });
        });
    });
}