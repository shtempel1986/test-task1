/**
 * Created by Павел on 31.03.2017.
 */
const widthInMs = 780 / (24 * 60 * 60 * 1000),
    widthInHours = 780 / 24,
    now = new Date(),
    namePerformer = ["","Иванов И.","Петров В."],
    month = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Февраль"
    ];
class Order {
    constructor(start, duration, performer) {
        this.start = start;
        this.duration = duration;
        this.performer = performer;
    }
}
let orders = [], ordersCount = -1;

jQuery.fn.orderPosition = function (order) {
    let left;
    left = (new Date(now.getFullYear(), order.start.month, order.start.day, order.start.hour).getTime() - now.getTime()) * widthInMs;

    return this.addClass("order draggable").css({
        width: order.duration * widthInHours,
        top: order.performer * 60,
        left: left
    }).appendTo(".rail");
};

$(document).ready(()=> {
    let tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)),
        afterHour = new Date(now.getTime() + (60 * 60 * 1000)),
        nextHour = new Date(afterHour.getFullYear(), afterHour.getMonth(), afterHour.getDate(), afterHour.getHours()),
        tomorrowStr = "",
        $addButton = $(".add-button").removeAttr("disabled"),
        $modalAdd = $("#modal-adding"),
        $wrapper = $("<div>").addClass("modal-wrapper").css({
            width: $(window).width(),
            height: $(window).height()
        }).appendTo("body").hide(),
        $releaseButton = $(".release-button").attr("disabled", "disabled").html("Расписание Опубликовано"),
        orderPerformer,
        orderStartToConfirm,
        tomorrowLeft = (new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()) - now.getTime()) * widthInMs;
    $modalAdd.appendTo($wrapper);
    for (let hours = 0; hours < 23; hours += 3) {
        let hoursTime = new Date(nextHour.getTime() + hours * 60 * 60 * 1000);
        let left = parseInt((hoursTime.getTime() - now.getTime()) * widthInMs);
        $("<span>").addClass("hour").css("left", left).html(`${hoursTime.getHours()}:00`)
            .appendTo(".time-line");
    }
    if (tomorrow.getDate() < 10) {
        tomorrowStr = `0${tomorrow.getDate()}`
    }
    else {
        tomorrowStr = `${tomorrow.getDate()}`
    }
    if (tomorrow.getMonth() < 10) {
        tomorrowStr += `.0${tomorrow.getMonth()+1}`
    }
    else {
        tomorrowStr += `.${tomorrow.getMonth()+1}`
    }
    tomorrowStr += `.${tomorrow.getFullYear()}`;
    $("<span>").addClass("tomorrow").css("left", tomorrowLeft).html(tomorrowStr)
        .appendTo(".time-line");

    $addButton.click(()=> {
        let top, left;
        $modalAdd.css({
            "display": "inline-block"
        });
        $wrapper.show();
        top = ($wrapper.height() / 2 - $modalAdd.height() / 2);
        left = ($wrapper.width() / 2 - $modalAdd.width() / 2);
        $modalAdd.css({
            top: parseInt(top),
            left: parseInt(left)
        });

        $("#submit-adding").click(function () {
            let orderDate, orderHour, orderDuration, orderStart = {
                "day": "",
                "hour": "",
                "month": ""
            }, $orderDrag;
            orderHour = $("#hour").val();
            orderDuration = $("#duration").val();
            if ($("#date").val() == "today") {
                orderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), orderHour);
            } else {
                orderDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), orderHour)
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
                    let xInElement = event.pageX - $orderDrag.offset().left,
                        yInElement = event.pageY - $orderDrag.offset().top,
                        $parent = $(this).parent();
                    $(window).mousemove((event1) => {
                        let left = event1.pageX - xInElement - $parent.offset().left, top = Math.floor(((event1.pageY - yInElement - $parent.offset().top + 30) / 60));
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
                    $(window).mouseup(() => {
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
                alert(`Текущий Исполнитель: ${namePerformer[orderPerformer]}
Дата начала: ${month[orders[ordersCount].start.month]}, ${orders[ordersCount].start.day} число, в ${orders[ordersCount].start.hour}:00
Продолжительность (Часов): ${orders[ordersCount].duration}.`);
                $(".draggable").removeClass("draggable").addClass("confirmed").off("mousedown");
                $(this).attr("disabled","disabled");
                $addButton.removeAttr("disabled")
            }
        }
    });
});