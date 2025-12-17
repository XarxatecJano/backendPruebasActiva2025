import { Hono } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const authRouter = new Hono();

authRouter.post("/login", async (c)=>{
    const body = await c.req.parseBody();
    const query = `SELECT username, password, role FROM "User" WHERE username = '${body.username}'`;
    const result = await poolActiva.query(query);
    
    const isValidUsername = result.rowCount > 0;
    if (!isValidUsername) return c.redirect("/login.html?error=1");

    if (isValidUsername && typeof body.password == 'string') {
        const isValidPassword = await bcrypt.compare(body.password, result.rows[0].password)
        if (!isValidPassword) return c.redirect("/login.html?error=1");
        if (isValidPassword) {
            const jwtToken = jwt.sign(
                {username: result.rows[0].username, role: result.rows[0].role},
                process.env.JSON_WEB_TOKEN_SECRET,  
                {expiresIn: "8h"}
            )
            c.header('Set-Cookie', `token=${jwtToken}; HttpOnly; Path=/`);
            return c.redirect("/home.html");
        } 
    }
});

export default authRouter;