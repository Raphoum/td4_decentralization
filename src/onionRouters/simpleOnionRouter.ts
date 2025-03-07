import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, rsaDecrypt } from "../crypto";
import axios from "axios";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  const { publicKey, privateKey } = await generateRsaKeyPair();
  const exportedPubKey = await exportPubKey(publicKey);

  await axios.post(`${REGISTRY_PORT}/register`, {
    nodeId,
    pubKey: exportedPubKey,
  });

  onionRouter.post("/message", async (req: Request, res: Response) => {
    const { encryptedData } = req.body;
    try {
      const decryptedData = await rsaDecrypt(encryptedData, privateKey);
      console.log(`Node ${nodeId} decrypted: ${decryptedData}`);

      res.json({ message: "Message processed" });
    } catch (error) {
      res.status(500).json({ error: "Decryption failed" });
    }
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}
