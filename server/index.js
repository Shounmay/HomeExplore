import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import { DATABASE } from './config.js';
import authroutes from './routes/auth.js';
import adRoutes from './routes/ad.js';
mongoose.set('strictQuery', false);
mongoose
	.connect(DATABASE)
	.then(() => console.log('DB connected'))
	.catch((err) => console.log('error: ', err));
const app = express();

//middlewares

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(cors());
app.use('/api', authroutes);
app.use('/api', adRoutes);

app.listen(8000, () => console.log('running on port 8000'));
