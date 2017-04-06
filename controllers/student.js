exports.getStudentForm = (req, res) => {
    res.render('student/studentForm', {
        title: 'Student Form'
    });
};

exports.getStudentResources = (req, res) => {
    res.render('student/studentResources', {
        title: 'Student Resources'
    });
};