function createBreadcrumb() {
    var pathname = window.location.pathname;
    var paths = pathname.split("/");
    //remove the first empty item
    paths.shift();
    var html = "<ol class=\"breadcrumb\"><li class=\"breadcrumb-item\"><a href=\"/\">Home</a></li>";
    var link = "";
    for (var i = 0; i < paths.length; i++) {
        if (i == paths.length - 1) {
            html += "<li class=\"breadcrumb-item active\">" + paths[i] + "</li>";
        } else {
            link+= "/" + paths[i];
            html += "<li class=\"breadcrumb-item\"><a href=\"" + link + "\">" + paths[i] + "</a></li>";
        }
    };
    html += "</ol>";
    return html;
}

$(document).ready(function() {

    // Place JavaScript code here...

    $('#add-times-button').on("click", function(e) {
        e.preventDefault();
        $('#available option:selected').each(function() {
            $('#added').append($(this));
        });
        $('#added option:contains("Chosen times will show up here...")').remove();
    });

    $('#remove-times-button').on("click", function(e) {
        e.preventDefault();
        $('#added option:selected').each(function() {
            $('#available').append($(this));
        });
    });

    $('#timeform').on("submit", function(e) {
       $('#added option').prop('selected', true);
    });

});