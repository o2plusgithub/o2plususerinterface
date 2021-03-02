        
    $(window).bind("load", function() {
        $("#registrationjs").delay(100).fadeIn(1000);
    })

    function GetUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    function loginredirectjs() {
        var base_url = window.location.origin;
        window.location.replace(base_url + "/login_page?token=" + GetUrlParameter("token"));
    }


    function invalidForm() {
        var form = $(this);
        form.addClass("ani-ring");
        setTimeout(function() {
            form.removeClass("ani-ring");
        }, 1000);
    }



    function validateregForm() {
        var form = $('#registrationjs');
        post_data = $("#registrationjs").serializeArray();
        console.log(post_data);
        $.post('/registration', post_data, function(data, e) {
            data_json = JSON.parse(data);
            if (data_json.form_success) {
                setTimeout(function() {
                    $("#newuserregjs").fadeIn(1000);
                    $("#newuserregjs").delay(4000).fadeOut(1000);
                }, 5000);
            } else {
                if (data_json.form_dupname) {
                    form.addClass("ani-ring");
                    setTimeout(function() {
                        $("#dupuserjs").fadeIn(1000);
                        setTimeout(function() {
                            $("#dupuserjs").fadeOut(1000);
                        }, 10000);
                        form.removeClass("ani-ring");
                    }, 100);
                } else {
                    if (data_json.form_dupphone) {
                        form.addClass("ani-ring");
                        setTimeout(function() {
                            $("#dupphonejs").fadeIn(1000);
                            setTimeout(function() {
                                $("#dupphonejs").fadeOut(1000);
                            }, 10000);
                            form.removeClass("ani-ring");
                        }, 100);
                    } else {
                        if (data_json.form_dupdev) {
                            form.addClass("ani-ring");
                            setTimeout(function() {
                                $("#dupdevjs").fadeIn(1000);
                                setTimeout(function() {
                                    $("#dupdevjs").fadeOut(1000);
                                }, 10000);
                                form.removeClass("ani-ring");
                            }, 100);
                        } else {
                            form.addClass("ani-ring");
                            setTimeout(function() {
                                $("#serverissueregjs").fadeIn(1000);
                                setTimeout(function() {
                                    $("#serverissueregjs").fadeOut(1000);
                                }, 10000);
                                form.removeClass("ani-ring");
                            }, 100);
                        }
                    }
                }
            }
        });
    }