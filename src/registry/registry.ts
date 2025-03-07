import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodes: Node[] = [];

export async function launchRegistry(): Promise<express.Application> {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.get("/status", (req: Request, res: Response) => {
    res.json({ status: "Registry is running" });
  });

  _registry.post("/register", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;
    if (!nodeId || !pubKey) {
      res.status(400).json({ error: "Missing nodeId or pubKey" });
      return;
    }
    nodes.push({ nodeId, pubKey });
    res.json({ message: "Node registered successfully" });
  });

  _registry.get("/nodes", (req: Request, res: Response) => {
    res.json({ nodes });
  });

  _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return _registry;
}
