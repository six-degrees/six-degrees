function User (username, $el) {
  this.username = username;
  this.url = "https://api.github.com/users/" + username;
  this.$el = $el;

  this._loadData();
  this._displayInitialData(this.$el);
}

User.prototype._loadData = function () {
  var self = this;

  var $request = $.ajax({
    type: "GET",
    contentType: "application/json",
    url: this.url
  });

  $request.then(function (user) {
    self._displayUserData(user);
  });

  $request.fail(function () {
    self._displayError();
  })
}

User.prototype._displayInitialData = function ($el) {
  $el.addClass("col-xs-6 col-md-4 col-lg-3 user-profile");

  var $content = $(
    '<div class="panel panel-default">' +
        '<div class="panel-heading js-user-name user-name"></div>' +
        '<div class="panel-body js-user-content">' +
          '<div class="row">' +
            '<div class="col-xs-5">' +
              '<img class="js-user-avatar user-avatar" />' +
            '</div>' +
            '<div class="col-xs-7">' +
              '<div class="js-user-followers"></div>' +
              '<div class="js-user-following"></div>' +
              '<div class="js-loading">' +
                '<i class="fa fa-spinner fa-3x fa-spin"></i>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
    '</div>'
  );

  var $userName = $content.find(".js-user-name");
  var $followers = $content.find(".js-user-followers");
  var $following = $content.find(".js-user-following");

  $followers.hide();
  $following.hide();

  $el.attr("href", "https://github.com/" + this.username);

  $userName.text(this.username);

  $el.append($content);
}

User.prototype._displayUserData = function (user) {
  var $userName = this.$el.find(".js-user-name");
  var $avatar = this.$el.find(".js-user-avatar");

  var $followers = this.$el.find(".js-user-followers");
  var $following = this.$el.find(".js-user-following");

  var $loading = this.$el.find(".js-loading");

  this.$el.attr("href", user.html_url);

  $userName.text(user.login);

  var avatarUrl = user.avatar_url + "&s=72";

  $avatar.attr("src", avatarUrl);

  var followers = user.followers + " follower";
  var following = user.following + " following";

  if (user.followers != 1) {
    followers += "s";
  }

  $followers.text(followers);
  $following.text(following);

  $loading.fadeOut("fast", function () {
    $followers.fadeIn();
    $following.fadeIn();
  });
}

User.prototype._displayError = function () {
  var $error = $(
    '<div class="user-error text-center">' +
      '<i class="fa fa-frown-o fa-3x"></i><br />' +
      'This user can no longer be found.' +
    '</div>'
  )

  var $body = this.$el.find(".js-user-content");

  $body.empty();
  $body.append($error);
}
