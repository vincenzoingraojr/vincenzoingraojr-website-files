$(document).ready(function(){
    $("div.menu-button").click(function(){
        $("div.menu-button").toggleClass("clicked");
        $("div.nav").toggleClass("visible");
        $("html").toggleClass("blocked");
        $("body").toggleClass("not-scrolling");
    });
    var slideIndex = 1;
    showDivs(slideIndex);
    function showDivs(n) {
        var i;
        var x = document.getElementsByClassName("home-content");
        if (n > x.length) {slideIndex = 1}
        if (n < 1) {slideIndex = x.length} ;
        for (i = 0; i < x.length; i++) {
            x[i].classList.remove("current");
        }
        x[slideIndex-1].classList.add("current");
        document.getElementById("count").innerHTML = "<div class=\"count-item\">" + slideIndex + "</div>" + "/" + x.length;
    }
    $("#next").click(function(){
        showDivs(slideIndex += 1);
    });
    $("#previous").click(function(){
        showDivs(slideIndex += -1);
    });
});
$(window).scroll(function(){
    if($(this).scrollTop() > 800) {
        $("div.essay-title-head").addClass("display");
    }
    else {
        $("div.essay-title-head").removeClass("display");
    }
});
var lunrIndex, $results, pagesIndex;
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&'); 
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if(pair[0] === variable) {
            return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
        }
    }
} 
var searchTerm = getQueryVariable('query');
function initLunr() {
    $.getJSON("/index.json")
        .done(function(index) {
            pagesIndex = index;
            console.log("index:", pagesIndex);
            lunrIndex = lunr(function() {
                this.field("title", { boost: 10 });
                this.field("summary", { boost: 5 });
                this.field("content");
                this.ref("permalink");
                pagesIndex.forEach(function (page) {
                    this.add(page)
                }, this)
            });
        })
        .fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.error("Error getting Hugo index file:", err);
        });
}
function initUI() {
    $results = $("#search-results");
    $("#search-query").keyup(function() {
        $results.empty();
        var query = $(this).val();
        if(query.length < 2) {
            return;
        }
        var results = search(query);
        renderResults(results);
    });
} 
/**
* @param  {String} query
* @return {Array}  results
*/
function search(query) {
    return lunrIndex.search(query).map(function(result) {
            return pagesIndex.filter(function(page) {
            return page.permalink === result.ref;
        })[0];
    });
}
/**
* @param  {Array} results to display
*/
function renderResults(results) {
    if(!results.length) {
        return;
    }
    results.slice(0, 100).forEach(function(result) {
        var $result = ("<a class=\"result\" href=\"" + result.permalink + "\">") + ("<div class=\"result-title\">" + result.title + "</div>") + ("<div class=\"result-summary\">" + result.summary + "</div>") + ("</a>");
        $results.append($result);
    });
}
initLunr();
$(document).ready(function() {
    initUI();
});
firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        document.getElementById("signup").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("logout").style.display = "block";
        document.getElementById("user-profile").style.display = "block";
        var user = firebase.auth().currentUser;
        var name, email;
        if (user != null) {
            name = user.displayName;
            email = user.email;
        }
        document.getElementById("display-email").innerHTML = "Email: " + email;
        document.getElementById("page-title").style.display = "none";
        document.getElementById("page-text").style.display = "none";
        document.getElementById("user-name").style.display = "block";
        document.getElementById("user-page-description").style.display = "block";
        document.getElementById("user-name").innerHTML = "Salve " + name + ".";
        document.getElementById("user-page-description").innerHTML = "Questa è la pagina dedicata alla tua utenza.";
        document.getElementById("error").style.display = "none";
        document.getElementById("reset-password-email").style.display = "none";
        document.getElementById("success-1").style.display = "none";
        $("div.reset-password-form").removeClass("not-hidden");
        document.getElementById("error-email").style.display = "none";
    }
    else {
        document.getElementById("signup").style.display = "block";
        document.getElementById("login").style.display = "block";
        document.getElementById("logout").style.display = "none";
        document.getElementById("user-profile").style.display = "none";
        document.getElementById("page-title").style.display = "block";
        document.getElementById("page-text").style.display = "block";
        document.getElementById("user-name").style.display = "none";
        document.getElementById("user-page-description").style.display = "none";
        document.getElementById("error").style.display = "none";
        document.getElementById("reset-password-email").style.display = "block";
        document.getElementById("success-2").style.display = "none";
    }
});
function signup() {
    var errorMessage = null;
    var r_email = document.getElementById("r-email").value;
    var r_password = document.getElementById("r-password").value;
    firebase.auth().createUserWithEmailAndPassword(r_email, r_password)
    .then((userCredential) => {
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: document.getElementById("name").value
        })
        location.reload();
    })
    .catch((error) => {
        if(error == null) {
            login(r_email, r_password);
        }
        document.getElementById("error").style.display = "block";
        var errorCode = error.code;
        errorMessage = error.message;
        document.getElementById("error").innerHTML = errorMessage + " Click to remove this alert.";
        errorMessage = null;
    });
}
function login() {
    var errorMessage = null;
    var l_email = document.getElementById("l-email").value;
    var l_password = document.getElementById("l-password").value;
    firebase.auth().signInWithEmailAndPassword(l_email, l_password)
    .then((userCredential) => {
        showUserComments();
        location.reload();
    })
    .catch(function(error) {
        document.getElementById("error").style.display = "block";
        var errorCode = error.code;
        errorMessage = error.message;
        document.getElementById("error").innerHTML = errorMessage + " Click to remove this alert.";
        errorMessage = null;
    });
}
function deleteUser() {
    var user = firebase.auth().currentUser;
    user.delete();
}
function resetPassword() {
    var auth = firebase.auth();
    var user = firebase.auth().currentUser;
    var emailAddress = user.email;
    auth.sendPasswordResetEmail(emailAddress);
    document.getElementById("success-2").style.display = "block";
}
function resetPasswordwithEmail() {
    var auth = firebase.auth();
    var emailAddress = document.getElementById("email-r-p").value;
    auth.sendPasswordResetEmail(emailAddress).then(function() {
        document.getElementById("success-1").style.display = "block";
        document.getElementById("error-email").style.display = "none";
    }).catch(function(error) {
        document.getElementById("error-email").style.display = "block";
        document.getElementById("success-1").style.display = "none";
    });
}
function logout() {
    firebase.auth().signOut();
}
firebase.auth().languageCode = 'it';
$(document).ready(function() {
    $("#register").click(function(){
        signup();
    });
    $("#access").click(function(){
        login();
    });
    $("#exit").click(function(){
        logout();
    });
    $("#error").click(function(){
        $("#error").fadeOut();
    });
    $("#success-1").click(function(){
        $("#success-1").fadeOut();
    });
    $("#success-2").click(function(){
        $("#success-2").fadeOut();
    });
    $("#error-email").click(function(){
        $("#error-email").fadeOut();
    });
    $("#delete").click(function(){
        deleteUser();
    });
    $("#reset-password").click(function(){
        resetPassword();
    });
    $("#reset-password-email").click(function(){
        $("div.reset-password-form").toggleClass("not-hidden");
        $("#success-1").fadeOut();
    });
    $("#send-password-reset").click(function(){
        resetPasswordwithEmail();
    });
});