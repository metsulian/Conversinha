const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Por favor, insira uma nome de usuário'],
        unique: [true, 'Nome de usuário já registrado'],
        minlength: [4, 'O nome de usuário deve ter no mínimo 6 caracteres.'],
        maxlength: [12, 'O nome de usuário deve ter no máximo 12 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Por favor, insira um email.'],
        unique: [true, 'Email já registrado'],
        validate: [isEmail, 'Por favor, insira um email válido']
    },
    password: {
        type: String,
        required: [true, 'Por favor, insira uma senha'],
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres.'],
        maxlength: [12, 'A senha deve ter no máximo 12 caracteres']
    }
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function(login, password) {
    const user = await this.findOne({
        $or: [
            { email: login },
            { username: login}
        ]
    });

    if ( user ) {
        const auth = await bcrypt.compare(password, user.password)
        if ( auth ) {
            return user
        }
        throw Error('Senha incorreta.')
    }
    throw Error('Login não cadastrado.')
}

const User = mongoose.model('user', userSchema);

module.exports = User;