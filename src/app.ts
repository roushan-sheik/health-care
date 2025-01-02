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
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFoundMiddleware } from "./app/middlewares/notFoundMiddleware";
app.use("/api/v1", appRoute);

app.use(notFoundMiddleware);
app.use(globalErrorHandler);

export { app };
