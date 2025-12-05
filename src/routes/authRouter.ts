import { Hono } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';

const authRouter = new Hono();

authRouter.post("/login", async (c)=>{
    const body = await c.req.parseBody();
    const query = `SELECT username, password, role FROM "User" WHERE username = '${body.username}'`;
    const result = await poolActiva.query(query);
    
    const isValidUsername = result.rowCount > 0;
    if (!isValidUsername) return c.json({"error": "Usuario y/o password incorrectos"}, 401);

    if (isValidUsername && typeof body.password == 'string') {
        const isValidPassword = await bcrypt.compare(body.password, result.rows[0].password)
        if (!isValidPassword) return c.json({"error": "Usuario y/o password incorrectos"}, 401);
        if (isValidPassword) return c.json({"msg": "autenticado con éxito"}, 200);
    }
});

export default authRouter;