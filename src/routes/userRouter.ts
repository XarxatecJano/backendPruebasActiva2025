import { Hono } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';

const userRouter = new Hono();

userRouter.get("/", async (c) => {
    const { rows } = await poolActiva.query('SELECT * FROM "User"');
    return c.json(rows);
});

userRouter.post("/", async (c) => {
    const body = await c.req.parseBody();
    if (typeof body.password == 'string'){
        const hashedPwd = await bcrypt.hash(body.password, 10);
        const query = `INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ('${body.username}', '${hashedPwd}', '${body.phone}', '${body.email}', '${body.zip_code}')`;
        const result = await poolActiva.query(query);
        return c.json(result);
    } else {
        return c.json({ error: 'Invalid password' }, 400);
    }
});

export default userRouter;
