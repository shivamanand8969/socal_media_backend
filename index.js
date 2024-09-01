import express, { urlencoded } from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
import connectDb from './utils/db.js';
import userRoute from './routes/user.routes.js'
import postRoute from './routes/post.routes.js'
import messageRoute from './routes/message.route.js'

dotenv.config({});
const PORT=process.env.PORT || 8000;
const app=express();

app.use(cors({
    origin:'*',  
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}))

app.get('/',(req,res)=>{
    return res.status(200).json({
        message:" i am comming from backend",
        success:true
    }) 
})
app.use('/api/v1/user',userRoute)
app.use('/api/v1/post',postRoute)
app.use('/api/v1/message',messageRoute)

app.listen(PORT,()=>{
    connectDb();
    console.log(`server is running on port number ${PORT}`);
})