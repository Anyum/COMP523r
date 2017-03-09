/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    res.render('instructorDashboard', {
        title: 'Instructor Dashboard',
        // TODO: implement ClientReqest.js MongoDB model, and write mongoose query here to count pending client requests
        pendingClientRequests: '0'
    });
};