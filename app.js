const express = require('express');
const app = express();
const connectDB = require('./config/db');

//Database connected
connectDB();

//init middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//set port
const PORT = process.env.PORT || 5000;

//routes
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
