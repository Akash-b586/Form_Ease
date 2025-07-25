"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const google_document_1 = __importDefault(require("./routes/google-document"));
const user_1 = __importDefault(require("./routes/user"));
const user_response_1 = __importDefault(require("./routes/user-response"));
const constants_1 = require("./common/constants");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const pino_1 = require("./common/pino");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Load environment variables
dotenv_1.default.config();
const AUTHORISATION = "Authorization";
const SOCKET_CONNECTED = "Socket connected: ";
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
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
};
app.use((0, cors_1.default)(corsOptions));
// for user authentication 
app.use((req, res, next) => {
    const authHeader = req.get(AUTHORISATION);
    if (!authHeader) {
        req.isUserAuth = false;
        return next();
    }
    const token = authHeader;
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, constants_1.SECRET_KEY);
    }
    catch (err) {
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
app.use(user_1.default);
// document routes
app.use(google_document_1.default);
//collecting user responses
app.use(user_response_1.default);
mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/google_form_clone").then(() => {
    pino_1.logger.info("Moongoose connected successfully..." /* REQUEST_SUCCESS_MESSAGE.DATABASE_CONNECTED_SUCCESSFULLY */);
    const server = app.listen(process.env.PORT || 9000, () => {
        pino_1.logger.info("Express server is up and running" /* REQUEST_SUCCESS_MESSAGE.APP_STARTED */);
    });
    const io = require('./common/Socket').init(server);
    io.on("connection" /* SOCKET_EVENTS.CONNECTION */, (socket) => {
        pino_1.logger.info(SOCKET_CONNECTED, socket.id);
    });
})
    .catch((err) => {
    pino_1.logger.error("Unable to connect the monog-db database" /* REQUEST_FAILURE_MESSAGES.ERROR_IN_CONNECTING_DB */, err);
    pino_1.logger.error("App crashed" /* REQUEST_FAILURE_MESSAGES.APP_CRASHED */);
    process.exit();
});
