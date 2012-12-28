(function($){
    var hole = null,
        digit = null,
        moving = false,
        selected = false,
        rotating = false,
        lastAngle = null,
        totalAngle = null,
        maxAngle = null,
        numberTimeout = null,
        centerX = null,
        centerY = null;

    Meteor.startup(function () {
        var rect = $('#dialer').get(0).getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    });

    var getAngle = function (x, y) {
        x -= centerX;
        y -= centerY;
        return 180 - (Math.atan2(x, y) * 180 / Math.PI);
    };

    var getAngleDiff = function (from, to) {
        if (from > to && from > 270 && to < 90)
            return 360 - from + to;

        if (from < to && to > 270 && from < 90)
            return 360 - to + from;

        return to - from;
    };

    var findDigit = function (e) {
        var x = e.clientX;
        var y = e.clientY;
        var digits = $$(".digit");

        for (var i = 0; i < digits.length; i++) {
            var rect = digits[i].getBoundingClientRect();
            if (rect.left <= x && rect.width + rect.left >= x &&
                rect.top <= y && rect.height + rect.top >= y)
                return i == 9 ? 0 : i + 1;
        }

        return null;
    };

    var findHole = function (e) {
        var x = e.clientX;
        var y = e.clientY;
        var holes = $$(".hole");

        for (var i = 0; i < holes.length; i++) {
            var rect = holes[i].getBoundingClientRect();
            if (rect.left <= x && rect.width + rect.left >= x &&
                rect.top <= y && rect.height + rect.top >= y)
                return holes[i];
        }

        return null;
    };

    var mousedown = function (event) {
        if (selected || moving) {
            return;
        }

        var currentDigit = findDigit(event);
        if (currentDigit === null) {
            return;
        }

        var currentHole = findHole(event);
        if (currentHole === null) {
            return;
        }

        maxAngle = 135;
        var rect = offset(currentHole);
        var holeAngle = getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2);

        if (holeAngle >= 135) {
            maxAngle += 360 - holeAngle;
        } else {
            maxAngle -= holeAngle;
        }

        digit = currentDigit;
        hole = currentHole;
        rotating = true;
        moving = true;
        lastAngle = getAngle(event.clientX, event.clientY);
        totalAngle = 0;
        $('#dialer').addClass('rotating');
        $('#center').addClass('rotating');
        event.preventDefault();
    };

    var mousemove = function (e) {
        if (!rotating || !moving) {
            return;
        }

        var angle = getAngle(e.clientX, e.clientY);
        var diff = getAngleDiff(lastAngle, angle);
        totalAngle += diff;
        var rotation = Math.min(maxAngle, Math.max(0, totalAngle));

        $('#dialer').get(0).style.MozTransform = "rotate(" + rotation + "deg)";
        $('#dialer').get(0).style.WebkitTransform = "rotate(" + rotation + "deg)";
        lastAngle = angle;
    };

    var mouseup = function (e) {
        if (!rotating || !moving) {
            return;
        }

        var rect = hole.getBoundingClientRect();
        $('#intro').text("");
        $('#number').text($('#number').text() + digit);
        $('#rewind-player').get(0).play();

        moving = false;
        lastAngle = null;
        totalAngle = null;
        $('#dialer').removeClass('rotating');
        $('#center').removeClass('rotating');
        $('#dialer').get(0).style.MozTransform = "";
        $('#dialer').get(0).style.WebkitTransform = "";

        var onEnd = function() {
            rotating = false;
        };
        setTimeout(onEnd, 800);
        clearTimeout(numberTimeout);
        numberTimeout = setTimeout(function() {
            playTrack($('#number').text());
            $('#number').text("");
        }, 3000);
    };

    var click = function (e) {
        if (rotating || moving)
            return;

        if ($('#center').hasClass("dialing")) {
            $('#center').removeClass("dialing");
            $('#number').text("");
        } else {
            $('#center').add("dialing");
            $('#number').text("");
            setTimeout(function() {
                $('#center').remove("dialing");
            }, 10000);
            playTrack(1);
        }
    };

    $('html').on('mouseup', 'body', mouseup);
    Template.dial.events({
        'mousedown #dialer': mousedown,
        'mousemove #dialer': mousemove,
        'click #center': click
    });

})(jQuery);