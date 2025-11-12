import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { poolActiva} from "./config/db.js";
const app = new Hono();


app.use("/*", serveStatic({ root: './public' }));


app.get("/User", async (c)=>{
    const { rows }= await poolActiva.query('SELECT * FROM "User"');
    return c.json(rows);
});

app.get("/UserA", async (c)=>{
    const { rows }= await poolActiva.query(`SELECT * FROM "User" WHERE username LIKE 'a%' OR username LIKE 'A%'`);
    return c.json(rows);
});

const port = process.env.PORT;
serve(app, ({port})=>{
    console.log(`App listening on http://localhost:${port}`);
});