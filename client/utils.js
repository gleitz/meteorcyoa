function playTrack(number) {
    number = parseInt(number, 10);
    if (number == 1980) {
        number = 2;
    }
    var padded = pad(number, 3);
    $('#player').attr('src', '/sounds/track' + padded + (buzz.isOGGSupported() ? '.ogg' : '.mp3')).get(0).play();
    return false;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function $$(sel) {
    return document.querySelectorAll(sel);
}

function offset(el) {
    var convertPoint = window.webkitConvertPointFromNodeToPage;
    if ('getBoundingClientRect' in el) {
        var boundingRect = el.getBoundingClientRect(),
            body = document.body || document.getElementsByTagName("body")[0],
            clientTop = document.documentElement.clientTop || body.clientTop || 0,
            clientLeft = document.documentElement.clientLeft || body.clientLeft || 0,
            scrollTop = (window.pageYOffset || document.documentElement.scrollTop || body.scrollTop),
            scrollLeft = (window.pageXOffset || document.documentElement.scrollLeft || body.scrollLeft);
        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            width: boundingRect.width,
            height: boundingRect.height
        };
    } else if (convertPoint) {
        var zeroPoint = new WebKitPoint(0, 0),
            point = convertPoint(el, zeroPoint),
            scale = convertPoint(document.getElementById('scalingEl'), zeroPoint);
        return {
            top: Math.round(point.y * -200/scale.y),
            left: Math.round(point.x * -200/scale.x)
        };
    }
}