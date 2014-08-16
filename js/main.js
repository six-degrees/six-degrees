var $startingUser = $(".js-starting-user-login");
var $endingUser = $(".js-ending-user-login");

var $connectTheDots = $(".js-connect-dots");
var $btnConnectTheDots = $(".js-btn-connect-dots");

var $followersChain = $(".js-followers-chain");

var followingSearch = new Search("data/followers/json/");
var followersSearch = new Search("data/following/json/");

followingSearch.getNextUsers = function (user) {
  return user.following;
}

followersSearch.getNextUsers = function (user) {
  return user.followers;
}

// intersect function grabbed from http://stackoverflow.com/a/16227294/359284
// Thanks to Paul S. for the Stack Overflow answer

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}

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

  var startingUser = $.trim($startingUser.val());
  var endingUser = $.trim($endingUser.val());

  followingSearch.reset();
  followersSearch.reset();

  followingSearch.add(startingUser);
  followersSearch.add(endingUser);

  followingSearch.queueFinished = function () {
    var intersection = intersect(followingSearch.discovered, followersSearch.discovered);

    this.shiftQueue();

    if (intersection.length == 0) {
      followersSearch.processQueue();
    } else {
      displayChain(reconstructChain(intersection));
    }
  }

  followersSearch.queueFinished = function () {
    var intersection = intersect(followingSearch.discovered, followersSearch.discovered);

    this.shiftQueue();

    if (intersection.length == 0) {
      followingSearch.processQueue();
    } else {
      displayChain(reconstructChain(intersection));
    }
  }

  followingSearch.processQueue();
});

function displayChain (chain) {
  $followersChain.empty();

  chain.forEach(function (user) {
    var $user = $("<a />");
    var userObject = new User(user, $user);

    $followersChain.append($user);
  });
}

function reconstructChain (intersection) {
  var followingChains = followingSearch.chains;
  var followersChains = followersSearch.chains;

  var completeChain = [];

  intersection.forEach(function (intersectingUser) {
    var startChain = [];
    var endChain = [];

    if (completeChain.length > 0) {
      return;
    }

    followingChains.forEach(function (chain) {
      var user = chain[chain.length - 1];

      if (user == intersectingUser) {
        startChain = chain;
      }
    });

    if (startChain.length == 0) {
      return;
    }

    followersChains.forEach(function (chain) {
      var user = chain[chain.length - 1];

      if (user == intersectingUser) {
        endChain = chain;
      }
    });

    if (endChain.length == 0) {
      return;
    }

    // Reverse the chain so it matches the natural order
    endChain.reverse();

    // Pop the duplicated user (the one who intersected) from the start chain
    startChain.pop();

    completeChain = startChain.concat(endChain);
  })

  return completeChain;
}
