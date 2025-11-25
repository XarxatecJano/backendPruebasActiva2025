import { Hono } from "hono";
import { poolActiva } from "../config/db.js";

const userRouter = new Hono();

userRouter.get("/", async (c) => {
    const { rows } = await poolActiva.query('SELECT * FROM "User"');
    return c.json(rows);
});

userRouter.post("/", async (c) => {
    const body = await c.req.parseBody();
    const query = `INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ('${body.username}', '${body.password}', '${body.phone}', '${body.email}', '${body.zip_code}')`;
    const result = await poolActiva.query(query);
    return c.json(result);
});

export default userRouter;
