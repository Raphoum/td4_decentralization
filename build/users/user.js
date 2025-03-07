"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
const axios_1 = __importDefault(require("axios"));
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    _user.post("/send", async (req, res) => {
        try {
            const { message, destinationUserId } = req.body;
            const { data: registry } = await axios_1.default.get(`${config_1.REGISTRY_PORT}/nodes`);
            const nodes = registry.nodes;
            if (nodes.length < 3) {
                return res.status(400).json({ error: "Not enough nodes available" });
            }
            let encryptedMessage = message;
            for (let i = nodes.length - 1; i >= 0; i--) {
                encryptedMessage = await (0, crypto_1.rsaEncrypt)(encryptedMessage, nodes[i].pubKey);
            }
            await axios_1.default.post(`http://${nodes[0].nodeId}/message`, {
                encryptedData: encryptedMessage,
            });
            return res.json({ message: "Message sent" });
        }
        catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
