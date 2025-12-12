import { Context } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';
import { User } from "../types/User.js";
import { UserModel } from "../model/UserModel.js";

export class UserController{

    static async findUsers(c:Context){
            
            const users: User[] = await UserModel.findUsers();
            if (!users){
                return c.json({ error: 'Error al obtener usuarios' }, 500);
            }
            return c.json(users);
    }

    static async newUser(c:Context){
        const body = await c.req.parseBody();
        if (typeof body.password == 'string'){
            const hashedPwd = await bcrypt.hash(body.password, 10);
            const query = `INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ('${body.username}', '${hashedPwd}', '${body.phone}', '${body.email}', '${body.zip_code}')`;
            const result = await poolActiva.query(query);
            return c.json(result);
        } else {
            return c.json({ error: 'Invalid password' }, 400);
        }
        
    }

    static async deleteUser(c:Context){
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
    }

    static async updateUser(c:Context){
       
        const body = await c.req.json();
        const userToUpdateId = c.req.param("id");
        try {
            const query = `UPDATE "User" SET username = '${body.username}', zip_code = '${body.zip_code}', phone = '${body.phone}', email = '${body.email}', role = '${body.role}', updated_at = '${body.updated_at}' WHERE id = ${userToUpdateId}`;
            const result = await poolActiva.query(query);

            if (result.rowCount > 0) {
                return c.json({ success: true, message: 'Usuario actualizado correctamente' });
            } else {
                return c.json({ success: false, message: 'Usuario no encontrado' }, 404);
            }
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return c.json({ success: false, message: 'Error interno del servidor' }, 500);
        }
    }
    

}
    

