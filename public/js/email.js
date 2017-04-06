//TODO: We are getting JSON in on button press. Write a function to display it.

$(document).ready(function() {
    var recipients;

    $('#breadcrumb').append(createBreadcrumb());

    $(".pending").on("click", function(){
        $.get('/api/pendingProjects').then(function(JSON) {
            recipients = JSON;
        });
    })
    $(".approved").on("click", function(){
        $.get('/api/approvedProjects').then(function(JSON) {
            recipients = JSON;
        });
    })
    $(".rejected").on("click", function(){
        $.get('/api/rejectedProjects').then(function(JSON) {
            recipients = JSON;
        });
    })
    $(".deleted").on("click", function(){
        $.get('/api/deletedProjects').then(function(JSON) {
            recipients = JSON;
        });
    })

});