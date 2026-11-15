

// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']);



// require('dotenv').config();

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');
// const mongoose = require('mongoose')
// const user = require('./model/user');
// const session = require('express-session');

// const config = require('./config/config');
// const limiter = require('./middleware/rateLimiter');
// const socketHandler = require('./socket/socketHandler');


// const app = express();

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false
// }));

// const server = http.createServer(app);
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// HEAD
// const mongoURI = process.env.MONGODB_URI;

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB Atlas connected successfully!'))
//     .catch((err) => console.log('MongoDB connection error:', err));

// mongoose.connect(mongoURI)
//     .then(() => console.log('Connect to MongoDB successfully!'))

// const mongoURI = process.env.MONGODB_URI;

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB Atlas connected successfully!'))

//     .catch((err) => console.log('MongoDB connection error:', err));

// const io = new Server(server);

// app.use(limiter);

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/login-page', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', "login.html"));
// });


// app.get('/registration-page', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'registration.html'));
// });

// app.post('/registration-page', async (req, res) => {
//     try {
//         const { username, email, password } = req.body;
//         const newUser = new user({ username, email, password });
//         await newUser.save();
//         res.send(`
//             <div class="container" style=" margin: 100px auto; background-image: radial-gradient(rgb(22, 237, 151), rgb(36, 187, 167)); width: 700px; height: auto; padding: 20px;">
//         <h1>Chat Application</h1>
//         <p>User registration successfully for chat application.</p>
//         <a href="/login-page" style="color: blue; font-weight: 700;" ><i>-Go Back Login Page</i></a>
//     </div>
//             `)
//     } catch (error) {
//         console.error('error saving data:', error);
//         res.status(500).send('An error occured while  fetching the data.')
//     }
// });

// app.post('/login', async (req, res) => {

//     const { email, password } = req.body;

//     try {

//         const foundUser = await user.findOne({ email });

//         if (!foundUser) {

//             return res.send(`
//                   <div class="container" style=" margin: 100px auto; background-image: radial-gradient(rgb(22, 237, 151), rgb(36, 187, 167)); width: 700px; height: auto; padding: 20px;">
//         <h1>Chat Application</h1>
//         <p>User not found.</p>
//         <a href="/login-page" style="color: blue; font-weight: 700;" ><i>-Go Back Login Page</i></a>
//     </div>
//             `);
//         }

//         if (foundUser.password !== password) {

//             return res.send(`
//                  <div class="container" style=" margin: 100px auto; background-image: radial-gradient(rgb(22, 237, 151), rgb(36, 187, 167)); width: 700px; height: auto; padding: 20px;">
//         <h1>Chat Application</h1>
//         <p>User Password Incorrect.</p>
//         <a href="/login-page" style="color: blue; font-weight: 700;" ><i>-Go Back Login Page</i></a>
//     </div>
//             `);
//         }

//         req.session.users = {
//             id: foundUser._id,
//             email: foundUser.email
//         };

//         req.session.save(() => {
//             res.redirect('/dashboard');
//         });

//     } catch (error) {

//         console.log('Login error:', error);
//         res.send('Server Error');

//     }
// });
// app.get('/dashboard', (req, res) => {

//     if (!req.session.users) {
//         return res.redirect('/login-page');
//     }
//     res.redirect('/');
//     // res.send(`
//     //     <div class="container" 
//     //     style="margin: 100px auto;
//     //     background-image: radial-gradient(rgb(22, 237, 151), rgb(36, 187, 167));
//     //     width: 700px;
//     //     padding: 20px;">
//     //         <h1>Chat Application</h1>
//     //         <p>User login successfully.</p>
//     //         <h3>${req.session.users.email}</h3>
//     //         <a href="/login-page">
//     //             Another Login User
//     //         </a>
//     //     </div>
//     // `);
// });

// app.get('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.send('Logout Error')
//         }
//         res.clearCookie('connect.sid');
//         res.redirect('/login-page');
//     })
// })


// app.get('/api/user-info', (req, res) => {
//     if (req.session && req.session.users) {
//         res.json({ email: req.session.users.email });
//     } else {
//         res.status(401).json({ error: "Unauthorized" });
//     }
// });
// socketHandler(io);


// server.listen(config.port, () => {
//     console.log(`Server running on port ${config.port}`);

//     const PORT = process.env.PORT || config.port || 3000;

//     server.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });


require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/user');
const session = require('express-session');

const config = require('./config/config');
const limiter = require('./middleware/rateLimiter');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error('MONGODB_URI is missing!');
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Atlas connected successfully!'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/registration-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.post('/registration-page', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.send(`
            <div class="container">
                <h1>Chat Application</h1>
                <p>User registration successful.</p>
                <a href="/login-page">Go Back to Login Page</a>
            </div>
        `);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Registration failed.');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.send('User not found. <a href="/login-page">Login</a>');
        }

        if (foundUser.password !== password) {
            return res.send('Incorrect password. <a href="/login-page">Login</a>');
        }

        req.session.users = {
            id: foundUser._id,
            email: foundUser.email
        };

        req.session.save(() => {
            res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.users) {
        return res.redirect('/login-page');
    }

    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout Error');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login-page');
    });
});

app.get('/api/user-info', (req, res) => {
    if (req.session && req.session.users) {
        return res.json({ email: req.session.users.email });
    }

    res.status(401).json({ error: 'Unauthorized' });
});

socketHandler(io);

const PORT = process.env.PORT || config.port || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
