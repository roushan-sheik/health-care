import express, { Application, Request, Response } from "express";

const app: Application = express();
// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
// Routes Imports =========================>
import { userRoutes } from "./app/modules/User/user.routes";
import { adminRoutes } from "./app/modules/Admin/admin.routes";

app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);

export { app };
