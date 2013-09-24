// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  Session.set("mySort","score");

  Template.leaderboard.players = function () {
      if (Session.equals("mySort","score")){
          return Players.find({}, {sort: {score: -1, name: 1}});
      }else{
          return Players.find({}, {sort: {name: 1, score: 1}});
      }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

    Template.leaderboard.events({
        'click input.sortToggle': function () {
            currSort = Session.get("mySort");
            if(currSort == "name"){
                Session.set("mySort", "score");
            }else{
                Session.set("mySort","name");
            }
        }
    });

    Template.leaderboard.events({
        'click input.randomizeScore': function () {
            Meteor.call(randomizeScore());
        }
    });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        randomizeScore();
    }
  });

}

Meteor.methods({
    randomizeScore: function () {
        Players.update({},{score: Math.floor(Random.fraction()*10)*5});
    }
});


