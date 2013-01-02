(function($){
    var hole,
        digit,
        moving,
        selected,
        rotating,
        lastAngle,
        totalAngle,
        maxAngle,
        numberTimeout,
        endTimeout,
        centerX,
        centerY,
        graph,
        $dialer,
        $phone_center,
        $number,
        $intro,
        currentPage = 1;

    Meteor.startup(function () {
        $dialer = $('#dialer'),
        $phone_center = $('#center');
        $number = $('#number .num');
        $intro = $('#intro');
        graph = $.graph();
        var rect = $dialer.get(0).getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;

        $('html').on('mouseup', 'body', mouseup)
            .on('click', 'body', function(evt) {
                if (!started) {
                    evt.preventDefault();
                    begin();
                }
            });
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
        $dialer.addClass('rotating');
        $phone_center.addClass('rotating');
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

        $dialer.get(0).style.MozTransform = "rotate(" + rotation + "deg)";
        $dialer.get(0).style.WebkitTransform = "rotate(" + rotation + "deg)";
        lastAngle = angle;
    };

    var mouseup = function (e) {
        if (!rotating || !moving) {
            return;
        }

        var rect = hole.getBoundingClientRect();
        $intro.text("");
        $number.text($number.text() + digit);
        $('#rewind-player').get(0).play();

        moving = false;
        lastAngle = null;
        totalAngle = null;
        $dialer.removeClass('rotating');
        $phone_center.removeClass('rotating');
        $dialer.get(0).style.MozTransform = "";
        $dialer.get(0).style.WebkitTransform = "";

        var onEnd = function() {
            $dialer.get(0).style.MozTransform = "";
            $dialer.get(0).style.WebkitTransform = "";
            rotating = false;
            moving = false;
        };
        clearTimeout(endTimeout);
        endTimeout = setTimeout(onEnd, 800);
        clearTimeout(numberTimeout);
        var numberSubmit = function() {
            var number = parseInt($number.text(), 10);
            if (number == 1980) {
                number = 2;
            }
            if (number == 0) {
                number = 10;
            }
            var page = Pages.findOne({id:number});
            var thisPage = Pages.findOne({id:currentPage});
            if (!page || (page && !_.contains(thisPage.children, page.id)) && (page.id != 2 && !graph.findNode(page.id))) {
                $number.text("");
                $intro.text('Invalid number');
                setTimeout(function() {
                    $intro.text('');
                }, 1000);
                return;
            }
            graph.addNode(page, currentPage);
            graph.centerNode(number);
            currentPage = number;
            $.each(page.children, function(i, e) {
                var padded = pad(e, 3);
                $('#preload' + (i + 1)).attr('src', '/sounds/track' + padded + (buzz.isOGGSupported() ? '.ogg' : '.mp3'));
            });
            playTrack(number);
            $number.text("");
        };
        numberTimeout = setTimeout(function myHandler() {
            if (!moving && !rotating) {
                numberSubmit();
            } else {
                numberTimeout = setTimeout(myHandler, 3000);
            }
        }, 3000);
    };

    var begin = function() {
        started = true;
        $('#chart').show();
        $phone_center.add("dialing");
        $number.text("");
        $intro.text("Welcome...");
        setTimeout(function() {
            $intro.text('');
        }, 15000);
        setTimeout(function() {
            $phone_center.remove("dialing");
        }, 10000);
        playTrack(1);
    };
    var started = false,
        click = function (e) {
            if (rotating || moving) {
                return;
            }

            if ($phone_center.hasClass("dialing")) {
                $phone_center.removeClass("dialing");
                $number.text("");
            } else {
                begin();
            }
        };

    Template.dial.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    Template.dial.events({
        'mousedown #dialer': mousedown,
        'mousemove #dialer': mousemove,
        'click #center': click
    });

})(jQuery);