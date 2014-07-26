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

$btnConnectTheDots.on("click", function (evt) {
    evt.preventDefault();

    foundChain = [];
    activeDegree = 1;
    activeConnections = 0;
    userQueue = {};

    scanDegree([$startingUser.val()], $endingUser.val());
});

var userCache = {};
var userQueue = {};

var activeConnections = 0;
var maxConnections = 10;

var activeDegree = 1;

var foundChain = [];

function scanDegree(chain, ending) {
    if (foundChain.length > 0) {
        return;
    }

    var currentUser = chain[chain.length - 1];

    var userData = checkUser(chain.length, currentUser);

    userData.then(function (data) {
        for (var u = 0; u < data.following.length; u++) {
            var follower = data.following[u];

            var clonedChain = chain.slice();

            clonedChain.push(follower);

            if (follower == ending) {
                displayChain(clonedChain);
                return;
            }

            scanDegree(clonedChain, ending);
        }
    });
}

function displayChain(chain) {
    foundChain = chain;
    console.log(chain);
}

function checkUser(degree, username) {
    var $p = $.Deferred();

    if (!(degree in userQueue)) {
        userQueue[degree] = [];
    }

    userQueue[degree].push([username, $p]);

    checkQueue();

    return $p;
}

function checkQueue () {
    if (foundChain.length > 0) {
        return;
    }

    var queue = userQueue[activeDegree];

    if (queue.length == 0) {
        if (activeConnections == 0) {
            activeDegree++;
            return;
        } else {
            window.setTimeout(checkQueue, 100);
            return;
        }
    }

    console.log(activeDegree, activeConnections, maxConnections);

    if (activeConnections < maxConnections) {
        var userData = queue.shift();

        if (userData == null) {
            return;
        }

        activeConnections += 1;

        var request = getFollowers(userData[0]);
        var $p = userData[1];

        request.then(function (data) {
            $p.resolve(data);
        })

        request.always(function () {
            activeConnections -= 1;
        });
    }
}

function getFollowers(username) {
    if (username in userCache) {
        return userCache[username];
    }

    var userUrl = "data/followers/json/" + username + ".json";

    var request = $.ajax({
        url: userUrl,
        contentType: "application/json",
        type: "GET"
    });

    request.always(function(data) {
        userCache[username] = request;
    });

    return request;
}
