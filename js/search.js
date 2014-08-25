function Search (url) {
  this.reset();

  this.url = url;

  this.MAXIMUM_ACTIVE_CONNECTIONS = 10;
  this.QUEUE_DELAY = 100;
}

Search.prototype.reset = function () {
  this.discovered = [];

  this.activeConnections = 0;

  this.searchQueue = [];
  this.nextSearchQueue = [];

  this.chains = [];
}

Search.prototype.checkUser = function (user) {
  return $.ajax({
    url: this.url + user + ".json",
    contentType: "application/json",
    type: "GET"
  });
}

Search.prototype.add = function (user, chain) {
  chain = chain ? chain.slice() : [];

  this.register(user, chain);

  // Push the user into the queue so the followers can be found for it
  this.searchQueue.push([user, chain]);
}

Search.prototype.addNext = function (user, chain) {
  chain = chain ? chain.slice() : [];

  this.register(user, chain);

  this.nextSearchQueue.push([user, chain]);
}

Search.prototype.register = function (user, chain) {
  // Check if the user has already been searched
  if (this.hasSearched(user)) {
    return;
  }

  chain.push(user);

  // Add the new chain into the existing list of chains
  this.chains.push(chain);

  this.discovered.push(user);
}

Search.prototype.hasSearched = function (user) {
  return (this.discovered.indexOf(user) >= 0);
}

Search.prototype.queueFinished = function () {
  // Placeholder method that should be overriden by subclasses
}

/*
 Move all users who are in the next search queue to the current search queue
 and reset the next search queue.
 */
Search.prototype.shiftQueue = function () {
  this.searchQueue = this.nextSearchQueue;
  this.nextSearchQueue = [];
}

Search.prototype.processQueue = function () {
  // Hold a reference to `this` so we can hold the reference in the timeout
  var self = this;

  if (self.activeConnections >= self.MAXIMUM_ACTIVE_CONNECTIONS) {
    // If all of the connections are in use, wait a bit until trying to
    // process the queue again
    window.setTimeout(function () {
      self.processQueue();
    }, self.QUEUE_DELAY);

    return;
  }

  // Fire the finished signal only when there is nothing left in the queue and
  // all connections have finished
  if (self.searchQueue.length == 0 && self.activeConnections == 0) {
    self.queueFinished();
    return;
  }

  // Process the queue until it is empty
  while (self.searchQueue.length > 0) {
    // Keep pushing to the console to make sure it didn't stall
    if (console != null && console.log != null) {
      console.log("Processing queue...");
    }

    // Check to see if all of the connections are in use
    if (self.activeConnections >= self.MAXIMUM_ACTIVE_CONNECTIONS) {
      // Stop trying to process the queue
      break;
    }

    // Pull the first item off the queue
    var queueItem = self.searchQueue.splice(0, 1);

    // If there is nothing left on the queue, just continue
    if (queueItem.length == 0) {
      continue;
    }

    // Process the item from the queue
    self.processQueueItem(queueItem[0]);
  }

  // Once the queue empties, fire it once more to call `queueFinished`
  window.setTimeout(function () {
    self.processQueue();
  }, self.QUEUE_DELAY);
};

Search.prototype.processQueueItem = function (queueItem) {
  var self = this;

  var user = queueItem[0];
  var chain = queueItem[1];

  self.activeConnections += 1;

  var $request = this.checkUser(user);

  $request.then(function (user) {
    var users = self.getNextUsers(user);

    users.forEach(function (u) {
      self.addNext(u, chain);
    });

    self.activeConnections -= 1;
  });

  $request.fail(function () {
    self.activeConnections -= 1;
  });
}
