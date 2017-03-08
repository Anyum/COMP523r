/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    res.render('instructorDashboard', {
        title: 'Instructor Dashboard'
    });
};