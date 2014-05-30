/**
 * Chats is the collection of all chat messages. Object has the structure
 * {
 * 		content: <String>
 * }
 */
Chats = new Meteor.Collection('chats');
if (Meteor.isClient) {
	Template.messages.messages = function(){
		return Chats.find({}, {sort: {timestamp: -1}});
	}
  Template.hello.greeting = function () {
    return "Welcome to chat.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
  Template.form.events({
	  'click input[name="submit"]': function(evt){
		  console.log('submit button clicked')
	  //insert chat content
	  	Chats.insert({
			content: $('#msg_content').val(),
			timestamp: new Date()
		})
  		//clear the chat box
		$('#msg_content').val('')
		$('#msg_content').focus();
	  }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
