require('dotenv').config()
const express = require("express");
const cors = require("cors");

//Imports
const {dbConnect} = require("./connection/dbConnect")

//MongoDB Connection
dbConnect("mongodb://127.0.0.1:27017/jungle")
.then(()=>console.log("MongoDB connected Successfully"));

const app = express();

//Middlewares
app.use(cors({
    origin:"*",
    credentials:true,
}));
app.use(express.json());

//Server Start
const PORT = 8000;
app.listen(PORT, ()=> console.log(`Server started at PORT: ${PORT}`));