firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        document.getElementById("comments-warning").style.display = "none";
        document.getElementById("all-comments").style.display = "block";
        var user = firebase.auth().currentUser;
        var name, email;
        if (user != null) {
            name = user.displayName;
            email = user.email;
        }
        document.getElementById("user-name-comment").innerHTML = "Nome: " + name;
        document.getElementById("user-email-comment").innerHTML = "Email: " + email;
    }
    else {
        document.getElementById("comments-warning").style.display = "block";
        document.getElementById("all-comments").style.display = "none";
    }
});
const rootRef = firebase.database().ref();
const commentsRef = rootRef.child('comments');
$(document).ready(function() {
    $("#submit-comment").click(function(){
        submitNewComment();
    });
});
function submitNewComment() {
    var newComment = document.getElementById("comment").value.replace(/\n/g, "<br>");
    var newPostRef = commentsRef.push();
    var user = firebase.auth().currentUser;
    var title = $("#title").text();
    newPostRef.set({
        nameComment: user.displayName.trim(),
        emailComment: user.email.trim(),
        comment: newComment.trim(),
        pageTitle: title.trim(),
        frompage: location.pathname,
        when: firebase.database.ServerValue.TIMESTAMP
    });
    location.reload();
    window.scrollTo(0, document.body.scrollHeight);
}
function showComments() {
    var showAt = document.getElementById("comments");
    var commentsRef = firebase.database().ref('comments/').orderByChild('frompage').equalTo(location.pathname);
    commentsRef.once('value', function(snapshot) {
        snapshot.forEach(function(itemSnapshot) {
            var itemData = itemSnapshot.val();
            var comment = itemData.comment;
            var nameComment = itemData.nameComment;
            var date = new Date(itemData.when).toLocaleDateString("it-it");
            showAt.innerHTML += "<li>" + "<span class=\"who-comments\">" + nameComment + "</span>" + "<span class=\"comment-date\">" + date + "</span>" + "<div class=\"comment-text\">" + comment + "</div>" + "</li>";
        });
    });
}
function showUserComments() {
    var showAt = document.getElementById("user-comments");
    var commentsRef = firebase.database().ref('comments/');
    commentsRef.once('value', function(snapshot) {
        snapshot.forEach(function(itemSnapshot) {
            var itemData = itemSnapshot.val();
            var comment = itemData.comment;
            var link = itemData.frompage;
            var date = new Date(itemData.when).toLocaleDateString("it-it");
            var emailComment = itemData.emailComment;
            var user = firebase.auth().currentUser;
            var emailAddress = user.email;
            var pageTitle = itemData.pageTitle;
            if(emailComment == emailAddress) {
                document.getElementById("account-comments").style.display = "block";
                document.getElementById("no-comments").style.display = "none";
                showAt.innerHTML += "<li>" + "<a href=\"" + link + "\">" + pageTitle + "</a>" + "<span class=\"comment-date\">" + date + "</span>" + "<div class=\"comment-text\">" + comment + "</div>" + "</li>";
            }
            else {
                document.getElementById("account-comments").style.display = "none";
                document.getElementById("no-comments").style.display = "block";
            }
        })
    });
}
$(document).ready(function() {
    showComments();
    showUserComments();
});