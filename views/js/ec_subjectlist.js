
    function menu_button() {
        $("#web_header").fadeToggle(300);
        $("#base_page_container").fadeToggle(300);
        $("#menu_container").delay(400).fadeToggle(300);
    }

    function menu_back() {
        $("#web_header").delay(400).fadeToggle(300);
        $("#base_page_container").delay(400).fadeToggle(300);
        $("#menu_container").fadeToggle(300);
    }

    window.onload = function() {
        $("#1").fadeIn(500);
        $("#2").delay(250).fadeIn(500);
        $("#3").delay(500).fadeIn(750);
    }

    function playlist_redirect(subject) {
        window.location.replace(window.location.origin + "/playlist?subject=" + subject)
    }

    function menu_redirect(redirect_id) {
        var base_url = window.location.origin;
        window.location.replace(base_url + "/" + redirect_id);
    }
    