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
    newPostRef.set({
        nameComment: user.displayName.trim(),
        comment: newComment.trim(),
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
$(document).ready(function() {
    showComments();
});