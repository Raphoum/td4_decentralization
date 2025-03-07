"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const nodes = [];
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    _registry.get("/status", (req, res) => {
        res.json({ status: "Registry is running" });
    });
    _registry.post("/register", (req, res) => {
        const { nodeId, pubKey } = req.body;
        if (!nodeId || !pubKey) {
            res.status(400).json({ error: "Missing nodeId or pubKey" });
            return;
        }
        nodes.push({ nodeId, pubKey });
        res.json({ message: "Node registered successfully" });
    });
    _registry.get("/nodes", (req, res) => {
        res.json({ nodes });
    });
    _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`Registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return _registry;
}
exports.launchRegistry = launchRegistry;
