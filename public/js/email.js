//TODO: Make onSubmit function to pass al relevant data to model function
function createTemplateButtons(templates){
    var html = "<span>";
    for (template of templates) {
        html += "<button id=\"" + template._id + "\" class=\"button-template btn btn-primary btn-sm\" type=\"button\">" + template.description + "</button>"
    }
    html += "</span>"
    return html;
}

$(document).ready(function() {
    //allRecipients is determined in step 1 based on category chosen
    var allRecipients;
    var clientType;
    var templates;
    //finalRecipients are the recipients selected in step 2
    var finalRecipients = [];
    var finalSubject;
    var finalBody;

    $('#breadcrumb').append(createBreadcrumb());

    $.get('/api/emailTemplates').then(function(JSON) {
        templates = JSON;
        $('#emailTemplates').empty();
        $('#emailTemplates').append(createTemplateButtons(templates));
    });

    $(".pending").on("click", function(){
        $.get('/api/pendingProjects').then(function(JSON) {
            allRecipients = JSON;
            finalRecipients = [];
            clientType = "pending";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    });
    $(".approved").on("click", function(){
        $.get('/api/approvedProjects').then(function(JSON) {
            allRecipients = JSON;
            finalRecipients = [];
            clientType = "approved";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    });
    $(".rejected").on("click", function(){
        $.get('/api/rejectedProjects').then(function(JSON) {
            allRecipients = JSON;
            finalRecipients = [];
            clientType = "rejected";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    });
    $(".deleted").on("click", function(){
        $.get('/api/deletedProjects').then(function(JSON) {
            allRecipients = JSON;
            finalRecipients = [];
            clientType = "deleted";
            $('#clientSelection').empty();
            $('#clientSelection').append(getClientHTML());
        });
    });

    //add clients to finalRecipients on click
    $("#clientSelection").on('click', '.checkbox', function(){
        var id = this.id;
        for (var i = 0; i < allRecipients.length; i++) {
            if (id == allRecipients[i]._id) {
                if ($(this).is(':checked')) {
                    finalRecipients.push(allRecipients[i]);
                } else {
                    for (var j = finalRecipients.length - 1; j>=0; j--) {
                        if (id == finalRecipients[j]._id) {
                            finalRecipients.splice(i,1);
                            return;
                        }
                    }
                }
                return;
            }
        }
    });
    //fill out the template form and get all final data in the right place
    $("#emailTemplates").on('click', '.button-template', function(){
        var id = this.id;
        var recipientTo = "";
        for (recipient of finalRecipients) {
            recipientTo += recipient.name + ", ";
        }
        $("#to").val(recipientTo);
        for (template of templates) {
            if (id == template._id) {
                $("#subject").val(template.subject);
                $("#message").val(template.body);
                for (recipient of allRecipients) {

                }
                finalSubject = template.subject;
                finalBody = template.body;
                return;
            }
        }
    });
    //TODO: remove if unnecessary
    $("#formoid").submit(function(event) {

        /* stop form from submitting normally */
        event.preventDefault();

        /* get the action attribute from the <form action=""> element */
        var $form = $( this ),
            url = $form.attr( 'action' );

        /* Send the data using post with element id name and name2*/
        var posting = $.post( url, { name: $('#name').val(), name2: $('#name2').val() } );

        /* Alerts the results */
        posting.done(function( data ) {
            alert('success');
        });
    });

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
        for (recipient of allRecipients) {
            html += "" +
            "<tr>" +
            "<th><input class=\"checkbox\" type=\"checkbox\" id=\"" + recipient._id +"\" value=\"" + recipient._id +"\"></th>" +
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
});