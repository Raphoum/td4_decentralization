"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
const axios_1 = __importDefault(require("axios"));
async function simpleOnionRouter(nodeId) {
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    const { publicKey, privateKey } = await (0, crypto_1.generateRsaKeyPair)();
    const exportedPubKey = await (0, crypto_1.exportPubKey)(publicKey);
    await axios_1.default.post(`${config_1.REGISTRY_PORT}/register`, {
        nodeId,
        pubKey: exportedPubKey,
    });
    onionRouter.post("/message", async (req, res) => {
        const { encryptedData } = req.body;
        try {
            const decryptedData = await (0, crypto_1.rsaDecrypt)(encryptedData, privateKey);
            console.log(`Node ${nodeId} decrypted: ${decryptedData}`);
            res.json({ message: "Message processed" });
        }
        catch (error) {
            res.status(500).json({ error: "Decryption failed" });
        }
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
