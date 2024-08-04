// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
// Config JSON response
app.use(express.json());

// Models
const User = require('./models/User');
const Destination = require('./models/Destination'); // Novo modelo

// Open route - public route
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a nossa API' });
});

// Private route
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    res.status(200).json({ user });
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado' });
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    } catch (error) {
        res.status(400).json({ msg: 'Token inválido' });
    }
}

// Register user
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    // Validations
    if (!name) {
        return res.status(422).json({ msg: 'O nome é obrigatório' });
    }
    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória' });
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas não conferem!' });
    }

    // Check if user exists
    const userExist = await User.findOne({ email: email });
    if (userExist) {
        return res.status(422).json({ msg: 'Por favor, utilize outro email' });
    }

    // Create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save();
        res.status(201).json({ msg: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Tente novamente mais tarde' });
    }
});

// Login user
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Check if password matches
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha não confere' });
    }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret
        );

        res.status(200).json({ msg: 'Autenticação realizada com sucesso', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Tente novamente mais tarde' });
    }
});

// Credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;


// Rota para buscar destinos e atrativos
app.get('/destinations', async (req, res) => {
    try {
        const destinations = await Destination.find();
        res.status(200).json(destinations);
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar destinos' });
    }
});

mongoose
    .connect(`mongodb+srv://rozenildeoliveirac:1oCm9AnS1Y4eGb3k@guiaturismo.tipdu9j.mongodb.net/?retryWrites=true&w=majority&appName=guiaturismo`)
    .then(() => {
        app.listen(3000, () => {
            console.log('Conectou ao banco e servidor iniciado na porta 3000');
        });
    })
    .catch((err) => console.log(err));