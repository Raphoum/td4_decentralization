import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_USER_PORT, REGISTRY_PORT } from "../config";
import { rsaEncrypt } from "../crypto";
import axios from "axios";

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  _user.post("/send", async (req: Request, res: Response) => {
    try {
      const { message, destinationUserId } = req.body;

      const { data: registry } = await axios.get(`${REGISTRY_PORT}/nodes`);
      const nodes = (registry as { nodes: { nodeId: string; pubKey: string }[] }).nodes;
      if (nodes.length < 3) {
        return res.status(400).json({ error: "Not enough nodes available" });
      }

      let encryptedMessage = message;
      for (let i = nodes.length - 1; i >= 0; i--) {
        encryptedMessage = await rsaEncrypt(encryptedMessage, nodes[i].pubKey);
      }

      await axios.post(`http://${nodes[0].nodeId}/message`, {
        encryptedData: encryptedMessage,
      });
      return res.json({ message: "Message sent" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}
