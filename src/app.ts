import express, { Application, Request, Response } from "express";

const app: Application = express();
// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Routes Imports =========================>
import appRoute from "./app/routes";
app.use("/api/v1", appRoute);

export { app };
