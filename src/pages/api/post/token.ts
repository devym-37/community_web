import { NextApiRequest, NextApiResponse } from "next";

type Response = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const response = await fetch("http://3.36.204.107/api/v1/post/token", {
    method: "POST",
    body: req.body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 201) {
    res.status(200).json(await response.json());
  }
}
