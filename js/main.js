var $startingUser = $(".js-starting-user-login");
var $endingUser = $(".js-ending-user-login");

var $connectTheDots = $(".js-connect-dots");
var $btnConnectTheDots = $(".js-btn-connect-dots");

/*
 Register a check on the `keyup` event of the starting and ending user input
 boxes.

 This will show the button to start the search if both the starting user and
 ending user are not blank.  It will also push the button into the tab order, so
 users can immediately tab into the button after entering the ending user.

 If either the starting user or the ending user is not filled in, the button
 will be hidden and it will be removed from the tab order.
 */
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

    // Only stop the queue if the search is still running.
    if ((activeConnections > 0 || activeDegree > 1) && searchChain) {
        stopSearch();

        console.log("Stopped the search");

        return;
    }

    searchChain = true;

    foundChain = [];

    clearData();

    scanDegree([$startingUser.val()], $endingUser.val());
});

var userCache = {};
var userQueue = {};

var activeConnections = 0;
var maxConnections = 10;

var activeDegree = 1;

var foundChain = [];
var searchChain = false;

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

/*
 Display the chain of users that can be used to connect the starting user to the
 ending user.  The first element passed in the array should be the starting
 user, and the last element should be the ending user.  Any other elements
 should appear in the array in the order that can be used to create the chain
 again.
 */
function displayChain(chain) {
    searchChain = false;
    foundChain = chain;
    console.log(chain);
}

/*
 Push a user into the checking queue under a specific degree.  This will also
 fire off the queue check to ensure the queue is always running when users
 should be searched.

 A promise will be returned that will resolve (with the follower data) if the
 user was found.  If the user was not found, the promise will never resolve.
 */
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
    if (!searchChain) {
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
        var userData = queue.splice(0, 1);

        if (userData.length === 0) {
            return;
        }

        userData = userData[0];

        activeConnections += 1;

        var request = getFollowers(userData[0]);
        var $p = userData[1];

        // If the user has already been searched, ignore the promise
        // This prevents us from searching the same branch multiple times
        if (request === true) {
            activeConnections -= 1;
            return;
        }

        // If the user could not be found before, assume it can't be found again
        if (request === false) {
            activeConnections -= 1;
            return;
        }

        request.then(function (data) {
            $p.resolve(data);
        })

        request.always(function () {
            activeConnections -= 1;
        });
    }
}

/*
 Try to make a request to get the followers for a user.

 Note:
 - This will return `true` if the request has already been made and the list of
   followers could be retrieved.
 - This will return `false` if the request has already been made and the list of
   followers could not be retrieved.
 - This will return a jQuery promise object containing the outgoing request if
   the request has not already been made.
 */
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

    request.then(function () {
        userCache[username] = true;
    });

    request.fail(function () {
        userCache[username] = true;
    })

    return request;
}

/*
 Reset the variables used during the search so that another search can be done.
 */
function clearData() {
    activeDegree = 1;
    activeConnections = 0;
    userQueue = {};
    userCache = {};
}

/*
 Stop the current search and clear out any data that has been stored.
 */
function stopSearch() {
    searchChain = false;

    clearData();
}
