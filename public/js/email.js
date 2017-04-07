//TODO: We are getting JSON in on button press. Write a function to display it.

$(document).ready(function() {
    var recipients;
    var clientType;

    $('#breadcrumb').append(createBreadcrumb());

    $(".pending").on("click", function(){
        $.get('/api/pendingProjects').then(function(JSON) {
            recipients = JSON;
            clientType = "pending";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    })
    $(".approved").on("click", function(){
        $.get('/api/approvedProjects').then(function(JSON) {
            recipients = JSON;
            clientType = "approved";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    })
    $(".rejected").on("click", function(){
        $.get('/api/rejectedProjects').then(function(JSON) {
            recipients = JSON;
            clientType = "rejected";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    })
    $(".deleted").on("click", function(){
        $.get('/api/deletedProjects').then(function(JSON) {
            recipients = JSON;
            clientType = "deleted";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    })

    function getClientHTML() {
        var html = "" +
            "<h3>Select " + clientType + " clients</h3>" +
            "<table class=\"table table-striped\">" +
            "<thead>" +
            "<tr>" +
            "<th>selected</th>" +
            "<th>Name</th>" +
            "<th>Project</th>" +
            "<th>sentApproval</th>" +
            "<th>sentDenial</th>" +
            "<th>sentDeletion</th>" +
            "<th>sentSchedule</th>" +
            "<tbody>";
        for (recipient of recipients) {
            html += "" +
            "<tr>" +
            "<th><div class=\"checkbox\"><label><input type=\"checkbox\" value=\"" + recipient.id +"\"></label></div></th>" +
            "<th>" + recipient.name + "\n" +
            "<th>" + recipient.project + "</th>";
            if (recipient.sentApproval) {
                html += "<th></th><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span></th>";
            } else {
                html += "<th><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></th>";
            };
            if (recipient.sentDenial) {
                html += "<th></th><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span></th>";
            } else {
                html += "<th><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></th>";
            };
            if (recipient.sentDeletion) {
                html += "<th></th><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span></th>";
            } else {
                html += "<th><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></th>";
            };
            if (recipient.sentPitchSchedule) {
                html += "<th></th><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span></th>";
            } else {
                html += "<th><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></th>";
            };

        }
        return html
    };
    /*
    sentApproval: false,
    sentDenial: false,
    sentDeletion: false,
    sentPitchSchedule: false
    */

});