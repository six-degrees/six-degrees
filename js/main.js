var $startingUser = $(".js-starting-user-login");
var $endingUser = $(".js-ending-user-login");

var $connectTheDots = $(".js-connect-dots");
var $btnConnectTheDots = $(".js-btn-connect-dots");

var $form = $(".js-form");

var $progBeforeStart = $(".js-before-start");
var $progDuring = $(".js-during");
var $progLimitContinue = $(".js-limit-continue");
var $progFoundConnection = $(".js-found-connection");
var $progError = $(".js-error");
var $progNotFound = $(".js-not-found");

var $followersChain = $(".js-followers-chain");

var currentStep = 0;

var followingSearch = new Search("data/followers/json/");
var followersSearch = new Search("data/following/json/");

followingSearch.getNextUsers = function (user) {
  return user.following;
}

followersSearch.getNextUsers = function (user) {
  return user.followers;
}

$progDuring.hide();
$progLimitContinue.hide();
$progFoundConnection.hide();
$progError.hide();
$progNotFound.hide();

// intersect function grabbed from http://stackoverflow.com/a/16227294/359284
// Thanks to Paul S. for the Stack Overflow answer

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return $.grep(a, function (e) {
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

$form.on("submit", function (evt) {
  evt.preventDefault();

  currentStep = 0;

  updateCurrentStep(++currentStep);

  var startingUser = $.trim($startingUser.val());
  var endingUser = $.trim($endingUser.val());

  if (!startingUser || !endingUser) {
    return;
  }

  $progFoundConnection.fadeOut();
  $progLimitContinue.fadeOut();
  $progBeforeStart.fadeOut();
  $progError.fadeOut();
  $progDuring.fadeIn();
  $progNotFound.fadeOut();

  if ($btnConnectTheDots.hasClass("btn-danger")) {
    ga("send", "event", "Search", "Stop");

    $btnConnectTheDots.removeClass("btn-danger");
    $btnConnectTheDots.text("Lets connect these dots!");

    $progDuring.fadeOut();
    $progBeforeStart.fadeIn();

    followingSearch.reset();
    followersSearch.reset();
    return;
  }

  ga("send", "event", "Search", "Start");

  $btnConnectTheDots.addClass("btn-danger").text("Stop searching");

  followingSearch.reset();
  followersSearch.reset();

  followingSearch.add(startingUser);
  followersSearch.add(endingUser);

  followingSearch.queueFinished = function () {
    var intersection = intersect(followingSearch.discovered, followersSearch.discovered);
    var hasMoreToSearch = (this.nextSearchQueue.length > 0);

    this.shiftQueue();

    if (intersection.length == 0) {
      if (hasMoreToSearch) {
        updateCurrentStep(++currentStep);
        followersSearch.processQueue();
      } else {
        cantBeFound();
      }
    } else {
      displayChain(reconstructChain(intersection));
    }
  }

  followersSearch.queueFinished = function () {
    var intersection = intersect(followingSearch.discovered, followersSearch.discovered);
    var hasMoreToSearch = (this.nextSearchQueue.length > 0);

    this.shiftQueue();

    if (intersection.length == 0) {
      if (hasMoreToSearch) {
        updateCurrentStep(++currentStep);
        followingSearch.processQueue();
      } else {
        cantBeFound();
      }
    } else {
      displayChain(reconstructChain(intersection));
    }
  }

  var $checkStarting = followingSearch.checkUser(startingUser);
  var $checkEnding = followersSearch.checkUser(endingUser);

  $.when($checkStarting, $checkEnding)
    .then(function () {
      followingSearch.processQueue();
    })
    .fail(function () {
      $progDuring.fadeOut();
      $progError.fadeIn();

      $btnConnectTheDots.removeClass("btn-danger").text("Lets connect these dots!");
    });
});

function updateCurrentStep (step) {
  var $step = $(".js-step-count");

  var steps = step + " steps";

  if (step == 1) {
    steps = "one step";
  }

  $step.text(steps);
}

function displayChain (chain) {
  ga("send", "event", "Finished", "Could connect users");

  // Log the number of users in the chain
  ga("send", "Results", "Connected", "Required", chain.length);

  $progDuring.fadeOut();
  $progFoundConnection.fadeIn();

  $(".js-start-user").text(chain[0]);
  $(".js-end-user").text(chain[chain.length - 1]);

  $followersChain.empty();

  $(chain).each(function (idx) {
    var user = chain[idx];
    var $user = $("<a />");

    var userObject = new User(user, $user);

    $followersChain.append($user);
  });

  $btnConnectTheDots.removeClass("btn-danger");
  $btnConnectTheDots.text("Lets connect these dots!");
}

function cantBeFound () {
  ga("send", "event", "Finished", "Can't connect users");

  var startingUser = $.trim($startingUser.val());
  var endingUser = $.trim($endingUser.val());

  $(".js-start-user").text(startingUser);
  $(".js-end-user").text(endingUser);

  $btnConnectTheDots.removeClass("btn-danger");
  $btnConnectTheDots.text("Lets connect these dots!");

  $progDuring.fadeOut();
  $progNotFound.fadeIn();

  followingSearch.reset();
  followersSearch.reset();
}

function reconstructChain (intersection) {
  var followingChains = followingSearch.chains;
  var followersChains = followersSearch.chains;

  var completeChain = [];

  $(intersection).each(function (idx) {
    var intersectingUser = intersection[idx];

    var startChain = [];
    var endChain = [];

    if (completeChain.length > 0) {
      return;
    }

    $(followingChains).each(function (idx) {
      var chain = followingChains[idx];

      var user = chain[chain.length - 1];

      if (user == intersectingUser) {
        startChain = chain;
      }
    });

    if (startChain.length == 0) {
      return;
    }

    $(followersChains).each(function (idx) {
      var chain = followersChains[idx];

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
