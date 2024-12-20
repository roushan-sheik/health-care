# Go to prisma website and follow the website guides

```
https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
```

> src/app.ts

```ts
import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export { app };
import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export { app };
```

> src/server.ts

```ts
/* eslint-disable no-console */
import { Server } from "http";
import { app } from "./app";
const PORT = process.env.PORT || 8000;

async function main() {
  const server: Server = app.listen(PORT, () => {
    console.log(`\n Application is running on port: http://localhost:${PORT}`);
  });
}

main();
```
