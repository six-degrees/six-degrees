var $startingUser = $(".js-starting-user-login");
var $endingUser = $(".js-ending-user-login");

var $connectTheDots = $(".js-connect-dots");
var $btnConnectTheDots = $(".js-btn-connect-dots");

$startingUser.add($endingUser).on("keyup", function () {
    if ($.trim($startingUser.val()) && $.trim($endingUser.val())) {
        $connectTheDots.addClass("connectable");
        $btnConnectTheDots.attr("tabindex", "3");
    } else {
        $connectTheDots.removeClass("connectable");
        $btnConnectTheDots.attr("tabindex", "-1");
    }
});


var maxConnections = Math.pow(6, 6);
var userQue = [];

function getFollowers(username) {

    maxConnections -= 1;

    var user_url = "data/followers/json/" + username + ".json";

    var request = $.ajax({
        url: user_url,
        contentType: "application/json",
        type: "GET"
    });

    request.then(function(data) {
        if (maxConnections >= 0) {
            console.log(data.following);
            for (var i = 0; i < data.following.length; i++) {
                console.log("follower:", data.following[i]);
                getFollowers(data.following[i]);
            }
        }
    });

}

// Testing start user
var username = "gunthercox";
getFollowers(username)
