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

    scanConcurrently($startingUser.val(), $endingUser.val());
});

// intersect function grabbed from http://stackoverflow.com/a/16227294/359284
// Thanks to Paul S. for the Stack Overflow answer

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}

var followersCache = {};
var followingCache = {};

var userQueue = {};
var reverseUserQueue = {};

var activeConnections = 0;
var maxConnections = 10;

var activeDegree = 1;

var foundChain = [];
var searchChain = false;

var followersDiscovered = [];
var followingDiscovered = [];

var followersChains = [];
var followingChains = [];

function scanConcurrently(startingUser, endingUser) {
    followingChains = [[startingUser]];
    followersChains = [[endingUser]];

    followingDiscovered = [startingUser];
    followersDiscovered = [endingUser];

    scanDegree([startingUser], false);
    scanDegree([endingUser], true);
}

function scanDegree(chain, reverseSearch) {
    if (!searchChain) {
        return;
    }

    var currentUser = chain[chain.length - 1];

    var userData = checkUser(chain.length, currentUser, reverseSearch);

    userData.then(function (data) {
        var users = [];
        var discovered = [];
        var chains = [];

        if (reverseSearch) {
            users = data.followers;
            discovered = followersDiscovered;
            chains = followersChains;
        } else {
            users = data.following;
            discovered = followingDiscovered;
            chains = followingChains;
        }

        for (var u = 0; u < users.length; u++) {
            var follower = users[u];
            var clonedChain = chain.slice();

            clonedChain.push(follower);

            if (discovered.indexOf(follower) < 0) {
                discovered.push(follower);
                chains.push(clonedChain);
            }
        }

        intersection = intersect(followersDiscovered, followingDiscovered);

        if (intersection.length > 0) {
            displayChain(intersection);
            return;
        }

        for (var u = 0; u < users.length; u++) {
            var follower = users[u];

            var clonedChain = chain.slice();

            clonedChain.push(follower);

            scanDegree(clonedChain, reverseSearch);
        }
    });
}

/*
 Display the chain of users that can be used to connect the starting user to the
 ending user.  The users who intersected between the chains of followers and
 users being followed should be passed as the first argument.

 The chain of users that allowed for this intersection will be determined by
 searching through the stored chains and then displayed to the user.
 */
function displayChain(intersection) {
    searchChain = false;

    for(var i = 0; i < intersection.length; i++) {
        var intersect = intersection[i];

        var startChain = [];
        var endChain = [];

        for(var u = 0; u < followingChains.length; u++) {
            var chain = followingChains[u];

            if (chain[chain.length - 1] == intersect) {
                startChain = chain;
                break;
            }
        }

        for(var u = 0; u < followersChains.length; u++) {
            var chain = followersChains[u];

            if (chain[chain.length - 1] == intersect) {
                endChain = chain;
                break;
            }
        }

        // The end chain has the last user first, so we need to reverse it.
        // This will allow the last user to be at the end, in the same order as
        // the starting array.
        endChain.reverse();

        // The starting array's last user should match the first user of the end
        // array, so we will pop it off.  This will allow the two arrays to read
        // without duplicates when concatenated.
        startChain.pop();

        foundChain = startChain.concat(endChain);
        console.log(intersection, foundChain);

        return;
    }
}

/*
 Push a user into the checking queue under a specific degree.  This will also
 fire off the queue check to ensure the queue is always running when users
 should be searched.

 A promise will be returned that will resolve (with the follower data) if the
 user was found.  If the user was not found, the promise will never resolve.
 */
function checkUser(degree, username, reverseSearch) {
    var $p = $.Deferred();

    // reverseSearch is true when searching backwards.
    if (!reverseSearch) {
        if (!(degree in userQueue)) {
            userQueue[degree] = [];
        }

        userQueue[degree].push([username, $p]);
        checkQueue(userQueue[activeDegree], "getFollowers");
    } else {
        if (!(degree in reverseUserQueue)) {
            reverseUserQueue[degree] = [];
        }

        reverseUserQueue[degree].push([username, $p]);
        checkQueue(reverseUserQueue[activeDegree], "getFollowing");
    }

    return $p;
}

function checkQueue(queue, checkMethod) {
    if (!searchChain) {
        return;
    }

    // Ensure the queue is an array.
    queue = queue || [];

    if (queue.length == 0) {
        var forwardQueue = userQueue[activeDegree];
        var reverseQueue = reverseUserQueue[activeDegree];

        if (forwardQueue.length === 0 && reverseQueue.length === 0) {
            if (activeConnections == 0) {
                activeDegree++;
                return;
            } else {
                window.setTimeout(checkQueue, 100, queue, checkMethod);
                return;
            }
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

        var method = window[checkMethod];

        var request = method(userData[0]);
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
    if (username in followersCache) {
        return followersCache[username];
    }

    var userUrl = "data/followers/json/" + username + ".json";

    var request = $.ajax({
        url: userUrl,
        contentType: "application/json",
        type: "GET"
    });

    request.then(function () {
        followersCache[username] = true;
    });

    request.fail(function () {
        followersCache[username] = false;
    })

    return request;
}

/*
 Try to make a request to get the people following a user.

 Note:
 - This will return `true` if the request has already been made and the list of
   followers could be retrieved.
 - This will return `false` if the request has already been made and the list of
   followers could not be retrieved.
 - This will return a jQuery promise object containing the outgoing request if
   the request has not already been made.
 */
function getFollowing(username) {
    if (username in followingCache) {
        return followingCache[username];
    }

    var userUrl = "data/following/json/" + username + ".json";

    var request = $.ajax({
        url: userUrl,
        contentType: "application/json",
        type: "GET"
    });

    request.then(function () {
        followingCache[username] = true;
    });

    request.fail(function () {
        followingCache[username] = false;
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
    reverseUserQueue = {};

    followersCache = {};
    followingCache = {};

    followersDiscovered = [];
    followingDiscovered = [];

    followersChains = [];
    followingChains = [];
}

/*
 Stop the current search and clear out any data that has been stored.
 */
function stopSearch() {
    searchChain = false;

    clearData();
}
