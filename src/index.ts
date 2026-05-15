import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from './db/db.js';

const app:express.Application = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get("/home",function(req,res){
    res.json("Hello")
})


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
     console.log(`Server running on port ${PORT}`)
})