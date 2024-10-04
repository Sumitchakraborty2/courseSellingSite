const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Import all required modules
const { userRouter } = require('./routes/v1/user');
const { courseRouter } = require('./routes/v1/course');
const { adminRouter } = require('./routes/v1/admin');

const app = express();
const port = process.env.PORT||3002;
let requestCount = {};
// resetting the requestCount variable every 1 second
setInterval(() => {
    requestCount = {};
}, 1000);

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
app.use((req, res, next) => {
    const email = req.body.email;
    if(requestCount[email]){
        requestCount[email] += 1;

        if(requestCount[email] > 5) {
            return res.status(401).json("Too Many Request")
        } else{
            next();
        }

    } else{
        requestCount[email] = 1;
        next();
    }
})

// route handlers
app.use('/api/v1/user', userRouter);

app.use('/api/v1/courses', courseRouter);

app.use('/api/v1/admin', adminRouter);

app.get('/requestcount', (req, res) => {
    res.json({
        requestCount
    })
})