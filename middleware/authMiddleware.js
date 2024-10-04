const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'segredo', (err, decoded) => {
            if (err) {
                res.redirect('/');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/');
    }
};

module.exports = { requireAuth };