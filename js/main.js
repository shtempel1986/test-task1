"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Павел on 31.03.2017.
 */
var widthInMs = 780 / (24 * 60 * 60 * 1000),
    widthInHours = 780 / 24,
    now = new Date();

var Order = function Order(start, duration, performer) {
    _classCallCheck(this, Order);

    this.start = start;
    this.duration = duration;
    this.performer = performer;
};

var orders = [],
    ordersCount = -1;

jQuery.fn.orderPosition = function (order) {
    var left = void 0;
    left = (new Date(now.getFullYear(), order.start.month, order.start.day, order.start.hour).getTime() - now.getTime()) * widthInMs;

    return this.addClass("order draggable").css({
        width: order.duration * widthInHours,
        top: order.performer * 60,
        left: left
    }).appendTo(".rail");
};

$(document).ready(function () {
    var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000),
        afterHour = new Date(now.getTime() + 60 * 60 * 1000),
        nextHour = new Date(afterHour.getFullYear(), afterHour.getMonth(), afterHour.getDate(), afterHour.getHours()),
        tomorrowStr = "",
        $addButton = $(".add-button"),
        $modalAdd = $("#modal-adding"),
        $wrapper = $("<div>").addClass("modal-wrapper").css({
        width: $(window).width(),
        height: $(window).height()
    }).appendTo("body").hide(),
        $releaseButton = $(".release-button"),
        tomorrowLeft = (new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()) - now.getTime()) * widthInMs;
    $modalAdd.appendTo($wrapper);
    for (var hours = 0; hours < 23; hours += 3) {
        var hoursTime = new Date(nextHour.getTime() + hours * 60 * 60 * 1000);
        var left = parseInt((hoursTime.getTime() - now.getTime()) * widthInMs);
        $("<span>").addClass("hour").css("left", left).html(hoursTime.getHours() + ":00").appendTo(".time-line");
    }
    if (tomorrow.getDate() < 10) {
        tomorrowStr = "0" + tomorrow.getDate();
    } else {
        tomorrowStr = "" + tomorrow.getDate();
    }
    if (tomorrow.getMonth() < 10) {
        tomorrowStr += ".0" + tomorrow.getMonth();
    } else {
        tomorrowStr += "." + tomorrow.getMonth();
    }
    tomorrowStr += "." + tomorrow.getFullYear();
    $("<span>").addClass("tomorrow").css("left", tomorrowLeft).html(tomorrowStr).appendTo(".time-line");

    $addButton.click(function () {
        var top = void 0,
            left = void 0;
        $modalAdd.css({
            "display": "inline-block"
        });
        $wrapper.show();

        top = $wrapper.height() / 2 - $modalAdd.height() / 2;
        left = $wrapper.width() / 2 - $modalAdd.width() / 2;

        $modalAdd.css({
            top: parseInt(top),
            left: parseInt(left)
        });

        $("#submit-adding").click(function () {
            var orderDate = void 0,
                orderHour = void 0,
                orderDuration = void 0,
                orderStart = {
                "day": "",
                "hour": "",
                "month": ""
            };
            orderHour = $("#hour").val();
            orderDuration = $("#duration").val();
            if ($("#date").val() == "today") {
                orderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), orderHour);
            } else {
                orderDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), orderHour);
            }
            if (orderDate.getTime() < now.getTime()) {
                alert("Вы выбрали время раньше текущего.");
            } else {
                ordersCount++;
                console.log("trigger");
                orderStart.month = orderDate.getMonth();
                orderStart.day = orderDate.getDate();
                orderStart.hour = orderHour;
                orders.push(new Order(orderStart, orderDuration, 0));

                console.log(orders, ordersCount);
                $wrapper.hide();
                $("<div>").orderPosition(orders[ordersCount]);
                $(this).off("click");
                $addButton.attr("disabled", "disabled");
                $releaseButton.removeAttr("disabled");
            }
        });
    });
});