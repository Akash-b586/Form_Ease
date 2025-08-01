import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import questionsRouter from './routes/google-document';
import userRouter from './routes/user';
import userResponseRouter from './routes/user-response';
import { corsConfig, REQUEST_FAILURE_MESSAGES, REQUEST_SUCCESS_MESSAGE, SECRET_KEY, SOCKET_EVENTS } from './common/constants';
import cors from "cors";
import mongoose from 'mongoose';
import { logger } from './common/pino';
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

const AUTHORISATION = "Authorization";
const SOCKET_CONNECTED = "Socket connected: ";
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://form-ease-dusky.vercel.app'
  ],
  credentials: true,
  optionSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ]
}
app.use(cors(corsOptions));

// for user authentication 
app.use((req: any, res: any, next: any) => {
  const authHeader = req.get(AUTHORISATION);
  if (!authHeader) {
    req.isUserAuth = false;
    return next();
  }

  const token = authHeader;
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    req.isUserAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isUserAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isUserAuth = true;
  next();
});

// routes for user
app.use(userRouter);

// document routes
app.use(questionsRouter);

//collecting user responses
app.use(userResponseRouter);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/google_form_clone")  .then(() => {
    logger.info(REQUEST_SUCCESS_MESSAGE.DATABASE_CONNECTED_SUCCESSFULLY);
    const server = app.listen(process.env.PORT || 9000, () => {
      logger.info(REQUEST_SUCCESS_MESSAGE.APP_STARTED);
    });

    const io = require('./common/Socket').init(server);
    io.on(SOCKET_EVENTS.CONNECTION, (socket: any) => {
      logger.info(SOCKET_CONNECTED, socket.id);
    });
  })
  .catch((err) => {
    logger.error(REQUEST_FAILURE_MESSAGES.ERROR_IN_CONNECTING_DB, err);
    logger.error(REQUEST_FAILURE_MESSAGES.APP_CRASHED);
    process.exit();
  });
