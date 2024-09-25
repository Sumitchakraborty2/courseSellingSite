const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Import all required modules
const { userRouter } = require('./routes/v1/user');
const { courseRouter } = require('./routes/v1/course');
const { adminRouter } = require('./routes/v1/admin');

const app = express();
const port = 3002;

// creating connection to database
const dbUrl = process.env.db_URL;
mongoose.connect(dbUrl)
.then(() => {
    console.log("connected to database");
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    })
})
.catch( (err) => {
    console.log(`Error while connecting to database ${err}`);
    process.exit(1);
})

// middlewares
app.use(express.json());
app.use(cors());

// route handlers
app.use('/api/v1/user', userRouter);

app.use('/api/v1/courses', courseRouter);

app.use('/api/v1/admin', adminRouter);

