"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = exports.UNAUTHORIZED_ACCESS = exports.corsConfig = void 0;
exports.corsConfig = {
    origin: [
        'http://localhost:3000',
        'https://gf-clone-c266a.web.app',
        'https://gf-clone-c266a.firebaseapp.com'
    ],
    allowedHeaders: [
        "Authorization",
        "X-Requested-With",
        "Content-Type",
        "x-auth-token",
        "Origin",
        "Accept"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400, // NOTICE: 1 day
    credentials: true
};
exports.UNAUTHORIZED_ACCESS = "Unauthorised resource access..!";
exports.SECRET_KEY = process.env.SECRET_KEY || "somesupersecretsecret";
