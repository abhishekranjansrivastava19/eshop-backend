const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require("cors");
const authJwt = require("./helpers/jwt")
const errorHandler = require('./helpers/errorHandler');

app.use(cors());
app.options("*", cors());


// enviornment variable

require('dotenv/config');
const api = process.env.API_URL;

// Routers

const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");
const orderitemsRouter = require("./routers/orderitems");
const usersRouter = require("./routers/users");

// middleware

app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.get(authJwt);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler); 


app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/orderitems`, orderitemsRouter);
app.use(`${api}/users`, usersRouter);


// URI Connection Database

mongoose.connect("mongodb+srv://abhishek:7905355614@cluster0.cihvmuh.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbname: 'eshop-database'
})
.then(() => {
    console.log('database connection is ready');
})
.catch((err) => {
    console.log(err);
})



app.listen(3000 , () => {
    console.log('server is running http://localhost:3000');
});