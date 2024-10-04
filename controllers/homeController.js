const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    let errors = { email: '', password: '', username: ''};
    console.log(err);

    if (err.message === 'Login não cadastrado.') {
        errors.email = 'Este login não está cadastrado.'
    }

    if (err.message === 'Senha incorreta.') {
        errors.password = 'A senha está incorreta.';
    }

    if (err.code === 11000) {
        if (err.keyValue.hasOwnProperty('username')) {
            errors.username = 'Usuário já cadastrado.'
        } else {
            errors.email = 'Email já cadastrado.'
        }
    }

    if  (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
};

const maxAge = 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'segredo', {
        expiresIn: maxAge
    })
};

module.exports.home_get = (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'segredo', (err, decoded) => {
            if (err) {
                res.render('login');
            } else {
                res.redirect('/chat');
            }
        })
    } else {
        res.render('login');
    }
};

module.exports.login_post = async (req, res) => {
    const { login, password } = req.body;

    try {
        await User.login(login, password).then((user) => {
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.cookie('username', user.username);
            res.status(200).json({ user: user._id })
        })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.signup_post = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.create({ username, email, password });
        res.status(201).json({ user: user._id })
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
    }   
};

module.exports.logout_get = (req, res) => {
    res.clearCookie('jwt');
    res.clearCookie('username');
    res.send({ message: 'Logout realizado.'})
}