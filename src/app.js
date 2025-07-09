import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import healthCheckRoutes from './routes/healthCheck.route.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true,limit: '16kb'}));
app.use(express.static("public"));
app.use(cookieParser());

app.use('/api/v1/healthCheck',healthCheckRoutes);
app.use('/api/v1/auth', authRoutes);
app.get('/api/v1/test', (req,res) => {
    res.send(`deploy testing using github actions`);
})
export { app };