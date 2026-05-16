import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from './db/db.js';
import authRoutes from './routes/auth.routes.js';
import noteRoutes from './routes/note.route.js'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import openapiRoutes from './routes/openapi.routes.js';

const app:express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests, please try again later" },
});
app.use(limiter);

connectDB();

app.get("/home",function(req,res){
    res.json({
        "msg":"Server Running....."
    })
})


app.use("/", openapiRoutes); 
app.use("/", authRoutes);
app.use("/notes", noteRoutes);

app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Alok Yadav",
    email: "alokjar212@email.com",
    "my features": {
      "Rate Limiting": "Protects the API from abuse by limiting each IP to 500 requests per 15 minutes.Used 500 for automated testing request",
      "Ownership": "Only the note owner can update, delete, or share their notes. Shared users get read-only access as i have given limited access",
      "Search (extended feature)":"It helps to search the content using the keywords send in query params",
      "Pin Note":"In this feature suppose we have bunch of notes and want few notes to pin we can use this endpoint it returns the on top in array regardless when it is craeted"
    },
  });
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
     console.log(`Server running on port ${PORT}`)
})