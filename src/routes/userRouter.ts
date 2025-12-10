import { Hono } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';
import { isAdmin } from "../middleware/authMiddleware.js";

const userRouter = new Hono();

userRouter.get("/", isAdmin, async (c) => {
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

userRouter.delete("/:id", isAdmin, async(c)=>{
    const userToDeleteId = c.req.param("id");
    
    try {
        const query = `DELETE FROM "User" WHERE id = ${userToDeleteId}`;
        const result = await poolActiva.query(query);
        
        if (result.rowCount > 0) {
            return c.json({ success: true, message: 'Usuario eliminado correctamente' });
        } else {
            return c.json({ success: false, message: 'Usuario no encontrado' }, 404);
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        return c.json({ success: false, message: 'Error interno del servidor' }, 500);
    }
})

export default userRouter;
