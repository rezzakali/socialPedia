import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';

// dotenv configuration
dotenv.config();

const PORT = process.env.PORT;
const HOST_NAME = process.env.HOST_NAME;

// database connection

// app instance
const app = express();

// body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors policy
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

//  routes
app.get('/api/v1/auth', (req, res) => {
  res.send('Test');
});

// custom error handler
app.use(errorHandler);

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  res.status(500).json({ error: 'There was a server side error!' });
});

// listening the server
app.listen(PORT, HOST_NAME, () => {
  console.log(
    `Your server is running successfully on http://${HOST_NAME}:${PORT}`
  );
});
