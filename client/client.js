Meteor.startup(function () {

    // initialize Twitter and Facebook because meteor
    // will not process in the inline scripts
    (function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}})(document,"script","twitter-wjs");
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=243752609058382";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // hide address bar in safari
    addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
    function hideURLbar(){
        window.scrollTo(0,1);
    }
});