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

    req.check('numStudents', 'Group Size field is empty or not a number').notEmpty().isInt();
    req.check('student1', 'Student 1 Name is either empty or not Alpha').notEmpty().isAlpha();
    req.check('preferenceList', 'Project Preferences field is empty').notEmpty();

    errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/student');
    }

    if(req.body.numStudents==4&&(req.body.student2==""||req.body.student3==""||req.body.student4=="")){
        errors=[{msg: "Need 4 student names"}];
    }
    else if(req.body.numStudents==3&&(req.body.student2==""||req.body.student3==""||req.body.student4!="")){
        errors=[{msg: "Need to fill first 3 student names only"}];
    }
    else if(req.body.numStudents==2&&(req.body.student2==""||req.body.student3!=""||req.body.student4!="")){
        errors=[{msg: "Need to fill first 2 student names only"}];
    }
    else if(req.body.numStudents==1&&(req.body.student2!=""||req.body.student3!=""||req.body.student4!="")){
        errors=[{msg: "Need to fill first student name only"}];
    }
    else if (req.body.numStudents>4||req.body.numStudents<1){
        errors=[{msg: "Group size can only be 1 to 4"}];
    }


    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/student');
    }

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
