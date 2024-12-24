import express, { Application, Request, Response } from "express";
import { userRoutes } from "./app/modules/User/user.routes";

const app: Application = express();
// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api/v1", userRoutes);

export { app };
