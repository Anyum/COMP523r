const Student = require('../models/Student');

exports.getStudentForm = (req, res) => {
    res.render('student/studentForm', {
        title: 'Student Form'
    });
};

exports.getSubmissionSuccess = (req, res) => {
    res.render('student/studentSubmissionSuccess', {
        title: 'Successful Submission'
    });
};

exports.postStudentForm = (req, res, next) => {
    // req.assert('email', 'Email is not valid').isEmail();
    // req.assert('description', 'Description must be at least 50 characters long').len(50);
    // req.sanitize('email').normalizeEmail({ remove_dots: false });

    // const errors = req.validationErrors();

    /*
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/client-form');
    }
    */

    const student = new Student({
        numStudents: req.body.numStudents,
        student1: req.body.student1,
        student2: req.body.student2,
        student3: req.body.student3,
        student4: req.body.student4,
        preferenceList: req.body.preferenceList
    });

    student.save((err) => {
        if (err) { throw err; }
        else res.redirect('/successfulSubmission');
});
};


exports.getStudentResources = (req, res) => {
    res.render('student/studentResources', {
        title: 'Student Resources'
    });
};
