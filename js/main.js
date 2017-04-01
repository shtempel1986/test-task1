"use strict";

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

/**
 * Created by Павел on 31.03.2017.
 */
var widthInMs = 780 / (24 * 60 * 60 * 1000),
    widthInHours = 780 / 24,
    now = new Date(),
    namePerformer = ["", "Иванов И.", "Петров В."],
    month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Февраль"];

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
        $addButton = $(".add-button").removeAttr("disabled"),
        $modalAdd = $("#modal-adding"),
        $wrapper = $("<div>").addClass("modal-wrapper").css({
            width: $(window).width(),
            height: $(window).height()
        }).appendTo("body").hide(),
        $releaseButton = $(".release-button").attr("disabled", "disabled").html("Расписание Опубликовано"),
        orderPerformer = void 0,
        orderStartToConfirm = void 0,
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
        tomorrowStr += ".0" + (tomorrow.getMonth() + 1);
    } else {
        tomorrowStr += "." + (tomorrow.getMonth() + 1);
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
                },
                $orderDrag = void 0;
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
                orderStart.month = orderDate.getMonth();
                orderStart.day = orderDate.getDate();
                orderStart.hour = orderHour;
                orderStartToConfirm = orderDate;
                orderPerformer = 0;
                orders.push(new Order(orderStart, orderDuration, 0));
                $wrapper.hide();
                $("<div>").orderPosition(orders[ordersCount]);
                $(this).off("click");
                $addButton.attr("disabled", "disabled");
                $releaseButton.removeAttr("disabled").html("Опубликовать Расписание");
                $orderDrag = $(".draggable");
                $orderDrag.mousedown(function (event) {
                    $("body").css("user-select", "none");
                    var xInElement = event.pageX - $orderDrag.offset().left,
                        yInElement = event.pageY - $orderDrag.offset().top,
                        $parent = $(this).parent();
                    $(window).mousemove(function (event1) {
                        var left = event1.pageX - xInElement - $parent.offset().left,
                            top = Math.floor((event1.pageY - yInElement - $parent.offset().top + 30) / 60);
                        if (left < 0) left = 0;
                        if (left + $orderDrag.outerWidth() > $parent.width()) left = $parent.width() - $orderDrag.outerWidth();
                        if (top < 0) top = 0;
                        if (top > 2) top = 2;
                        $orderDrag.css({
                            "left": left,
                            "top": top * 60
                        });
                        orderPerformer = top;
                        orderStartToConfirm = new Date(now.getTime() + left / widthInMs);
                    });
                    $(window).mouseup(function () {
                        $("body").css("user-select", "text");
                        $(window).off("mousemove mouseup");
                        orders[ordersCount].start.month = orderStartToConfirm.getMonth();
                        orders[ordersCount].start.day = orderStartToConfirm.getDate();
                        orders[ordersCount].start.hour = orderStartToConfirm.getHours();
                        orders[ordersCount].start.performer = orderPerformer;
                    });
                });
            }
        });
    });
    $releaseButton.click(function () {
        if (!this.hasAttribute("disabled")) {
            if (orderPerformer == 0) {
                alert("Пожалуйста выберите исполнителя.");
            } else {
                alert("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C: " + namePerformer[orderPerformer] + "\n\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430: " + month[orders[ordersCount].start.month] + ", " + orders[ordersCount].start.day + " \u0447\u0438\u0441\u043B\u043E, \u0432 " + orders[ordersCount].start.hour + ":00\n\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C (\u0427\u0430\u0441\u043E\u0432): " + orders[ordersCount].duration + ".");
                $(".draggable").removeClass("draggable").addClass("confirmed").off("mousedown");
                $(this).attr("disabled", "disabled");
                $addButton.removeAttr("disabled");
            }
        }
    });
});