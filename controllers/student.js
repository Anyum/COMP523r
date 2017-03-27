exports.getStudentForm = (req, res) => {
    res.render('studentForm', {
        title: 'Student Form'
    });
};