var Dialer = {
    hole: null,
    digit: null,
    moving: false,
    rotating: false,
    lastAngle: null,
    totalAngle: null,
    maxAngle: null,
    numberTimeout: null,

    init: function () {
        this.dial = $("#dialer").get(0);
        this.number = $("#number");
        this.center = $("#center").get(0);
        this.rewind_player = $("#rewind-player").get(0);

        var rect = this.dial.getBoundingClientRect();
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;

        this.dial.addEventListener("mousedown", this.mousedown.bind(this));
        this.center.addEventListener("click", this.click.bind(this));
        addEventListener("mousemove", this.mousemove.bind(this));
        addEventListener("mouseup", this.mouseup.bind(this));
    },

    mousedown: function (e) {
        if (this.rotating || this.moving)
            return;

        var digit = this.findDigit(e);
        if (digit === null)
            return;

        var hole = this.findHole(e);
        if (hole === null)
            return;

        this.maxAngle = 135;
        var rect = offset(hole);
        var holeAngle = this.getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2);

        if (holeAngle >= 135)
            this.maxAngle += 360 - holeAngle;
        else
            this.maxAngle -= holeAngle;

        this.digit = digit;
        this.hole = hole;
        this.rotating = this.moving = true;
        this.lastAngle = this.getAngle(e.clientX, e.clientY);
        this.totalAngle = 0;
        this.dial.classList.add("rotating");
        this.center.classList.add("rotating");
        e.preventDefault();
    },

    mousemove: function (e) {
        if (!this.rotating || !this.moving)
            return;

        var angle = this.getAngle(e.clientX, e.clientY);
        var diff = this.getAngleDiff(this.lastAngle, angle);
        this.totalAngle += diff;
        var rotation = Math.min(this.maxAngle, Math.max(0, this.totalAngle));
        this.dial.style.MozTransform = "rotate(" + rotation + "deg)";
        this.dial.style.WebkitTransform = "rotate(" + rotation + "deg)";
        this.lastAngle = angle;
    },

    mouseup: function (e) {
        if (!this.rotating || !this.moving)
            return;

        var rect = this.hole.getBoundingClientRect();
        $('#intro').text("");
        this.number.text(this.number.text() + this.digit);
        this.rewind_player.play();

        this.moving = false;
        this.lastAngle = this.totalAngle = null;
        this.dial.classList.remove("rotating");
        this.center.classList.remove("rotating");
        this.dial.style.MozTransform = "";
        this.dial.style.WebkitTransform = "";

        var self = this;
        var onEnd = function() {
            self.rotating = false;
        }
        setTimeout(onEnd, 800);
        clearTimeout(this.numberTimeout);
        this.numberTimeout = setTimeout(function() {
            playTrack(self.number.text());
            self.number.text("");
        }, 3000);
    },

    click: function (e) {
        if (this.rotating || this.moving)
            return;

        var classes = this.center.classList;
        if (classes.contains("dialing")) {
            classes.remove("dialing");
            this.number.text("");
            this.call.hangUp();
            this.call = null;
        } else {
            classes.add("dialing");
            this.number.text("");
            setTimeout(function() {
                classes.remove("dialing");
            }, 10000);
            playTrack(1);
        }
    },

    getAngle: function (x, y) {
        x -= this.centerX;
        y -= this.centerY;
        return 180 - (Math.atan2(x, y) * 180 / Math.PI);
    },

    getAngleDiff: function (from, to) {
        if (from > to && from > 270 && to < 90)
            return 360 - from + to;

        if (from < to && to > 270 && from < 90)
            return 360 - to + from;

        return to - from;
    },

    findDigit: function (e) {
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
    },

    findHole: function (e) {
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
    }
};