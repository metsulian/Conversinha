const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

const mainRoutes = require('./routes/mainRoutes');

app.use('/', mainRoutes);
app.get('/chat', requireAuth, (req, res) => {
    const username = req.cookies.username;
    res.render('index', { username });
});

const users = {};

io.on('connection', (socket) => {
    socket.on('chatMessage', ({ msg, sender, reciever }) => {
        if ( reciever === 'Todos' ) {
            io.emit('chatMessage', { msg, sender })
        } else {
            if (users[reciever]) {
                users[reciever].emit('privateMessage', { msg, sender });
                socket.emit('privateMessage', { msg, sender: 'Você' });
            } else {
                socket.emit('chatMessage', { msg: 'Usuário ' + reciever + ' não encontrado.', sender: 'Sistema'});
            }
        }
    });
    socket.on('userConnected', (username) => {
        users[username] = socket;
        io.emit('userlistUpdate', Object.keys(users));
    });
})

const db = 'mongodb+srv://admin:admin@app1.ida3o.mongodb.net/?retryWrites=true&w=majority&appName=app1';
const PORT = process.env.PORT || 3000;
mongoose.connect(db)
    .then((result) => server.listen(PORT, () => { console.log('Servidor rodando em http://localhost:' + PORT); }))
    .catch((err) => console.log(err));