import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import analyticRoutes from './routes/analyticsRoutes.js'
import messageTemplateRoutes from './routes/messageTemplateRoutes.js'
import campaignsRoutes from './routes/campaignsRoutes.js'
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
app.use('/auth',authRoutes)
app.use('/users',userRoutes)
app.use("/users/admin", adminRoutes);
app.use("/outreachhub",contactRoutes,messageTemplateRoutes,campaignsRoutes,analyticRoutes);



const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI).then(() => {
  console.log("Connected to MongoDB Database successfully!");
  app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
  });
});


app.get('/',(req,res)=>{
    res.send("Welcome User")
});
