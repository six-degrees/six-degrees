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
