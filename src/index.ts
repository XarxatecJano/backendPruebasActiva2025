import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
//import { programmingHistoryFact } from "./middleware/programmingHistoryFact.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import { sessionParser } from "./middleware/authMiddleware.js";

const app = new Hono();

app.use("/*", serveStatic({ root: './public' }));
//app.use("/*", programmingHistoryFact);
app.use("/*", sessionParser);



app.route("/api/v1/User", userRouter);
app.route("/api/v1/auth", authRouter);


const port = process.env.PORT;
serve(app, ({port})=>{
    console.log(`App listening on http://localhost:${port}`);
});