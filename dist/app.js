"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const pinRoutes_1 = __importDefault(require("./routes/pinRoutes"));
const docxRoutes_1 = __importDefault(require("./routes/docxRoutes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
(0, db_1.default)();
/*
                                           /generateDocx
https://naala-api-steel.vercel.app/api/pins/generateDocx
https://naala-api-steel.vercel.app/api/pins/verifyPin
*/
const app = (0, express_1.default)();
// Use express
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["https://urbania-custom.com/", "https://naala.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use('/api/pins', pinRoutes_1.default);
app.use('/api/', docxRoutes_1.default);
exports.default = app;
