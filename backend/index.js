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

const app = express();
const port = 5000;
// app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
app.use('/auth',authRoutes)
app.use('/users',userRoutes)
app.use("/users/admin", adminRoutes);
app.use("/outreachhub",contactRoutes,messageTemplateRoutes,campaignsRoutes,analyticRoutes);



const Conn_URL =
  "mongodb+srv://krishdobariya:HXa5SASHyO8rmXZD@cluster0.uxlm8xp.mongodb.net/Demo?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(Conn_URL).then(() => {
  console.log("Connected to MongoDB Database successfully!");
  app.listen(port, () => {
    console.log(`Server is running on port: http://localhost:${port}`);
  });
});


app.get('/',(req,res)=>{
    res.send("Welcome User")
});
