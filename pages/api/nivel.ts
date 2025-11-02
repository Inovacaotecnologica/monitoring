import { NextApiRequest, NextApiResponse } from "next";

// Armazena temporariamente o último valor recebido
let ultimoNivel = 0;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { nivel } = req.body;

    // Validação simples
    if (typeof nivel === "number") {
      ultimoNivel = nivel;
      console.log("Novo nível recebido:", nivel);
      return res.status(200).json({ status: "ok", nivel });
    } else {
      return res.status(400).json({ error: "Campo 'nivel' inválido" });
    }
  }

  // Endpoint GET para o dashboard buscar o último valor
  if (req.method === "GET") {
    return res.status(200).json({ nivel: ultimoNivel });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}
