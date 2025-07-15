import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import healthCheckRoutes from './routes/healthcheck.route.js';
import authRoutes from './routes/auth.routes.js';
import multer from 'multer';
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', //process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true,limit: '16kb'}));
app.use(express.static("public"));
app.use(cookieParser());
const sampleMiddleware = (req,res,next) => {
    console.log('sample middleware');
    next();
}
app.use('/api/v1/healthCheck',healthCheckRoutes);
app.use('/api/v1/auth',  authRoutes);
app.get('/api/v1/test', (req,res) => {
    res.send(`deploy testing using github actions`);
})

app.use((err, req, res, next) => {
   if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Custom or general errors
    return res.status(400).json({ error: err.message });
  }
  next();
})
export { app };