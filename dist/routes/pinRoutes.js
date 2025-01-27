"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pinController_1 = require("../controllers/pinController");
const router = (0, express_1.Router)();
router.post("/generate", pinController_1.generatePin);
router.post('/verifyPin', pinController_1.verifyPin);
router.post('/generateDocx', pinController_1.generateDocx);
exports.default = router;
