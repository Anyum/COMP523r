$(document).ready(function() {

    console.log(subject);
    console.log(recipients);
    console.log(senderName);
    console.log(body);

    $('.body').empty();
    $('.body').append(body);

    $('.mailTo').click(function(){
        var id = this.id;
        for (recipient of recipients) {
            if (recipient._id == id) {
                this.href = "mailto:" + recipient.email;
                this.href += "?subject=" + subject;
                this.href += "&body=" + encodeURIComponent(personalizeEmail(body, recipient.name));
            }
        }
    });
});

function personalizeEmail(message, clientName) {
    message = message.replace("{Client}", clientName);
    message = message.replace("{Instructor}", senderName);
    return message;
}