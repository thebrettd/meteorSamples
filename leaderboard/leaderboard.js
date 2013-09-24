// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

    Session.set("mySort", "score");

    Template.leaderboard.players = function () {
        if (Session.equals("mySort", "score")) {
            return Players.find({}, {sort: {score: -1, name: 1}});
        } else {
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

    Template.leaderboard.events({
        'click input.deletePlayer': function () {
            Players.remove(Session.get("selected_player"));
        }
    });

    Template.player.events({
        'click': function () {
            Session.set("selected_player", this._id);
        }
    });

    Template.leaderboard.events({
        'click input.sortToggle': function () {
            if (Session.get("mySort") == "name") {
                Session.set("mySort", "score");
            } else {
                Session.set("mySort", "name");
            }
        }
    });

    Template.leaderboard.events({
        'click input.randomizeScore': function () {
            Meteor.call("randomizeScore");
        }
    });

    Template.leaderboard.events({
        'click input.addPlayer': function () {
            inputName = window.prompt("Enter new player's name","Player");
            if (inputName != null && inputName != ""){
                Meteor.call("addPlayer",inputName);
            }else{
                window.alert("Please enter a valid name");
            }
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
                Players.insert({name: names[i]});
        }
        Meteor.call("randomizeScore");
    });

    Meteor.methods({
        randomizeScore: function () {
            var players = Players.find({});
            players.forEach(function (player) {
                Players.update({name: player.name}, {$set: {score: Math.floor(Random.fraction() * 10) * 5}});
            });
        },
        addPlayer: function(inputName){
            Players.insert({name: inputName, score: 0});
        }
    });
}



