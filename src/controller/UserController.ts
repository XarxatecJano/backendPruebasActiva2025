import { Context } from "hono";
import { poolActiva } from "../config/db.js";
import bcrypt from 'bcrypt';
import { newUserDTO, User } from "../types/User.js";
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
        const hashedPwd = await bcrypt.hash(body.password as string, 10);
        const newUser: newUserDTO = {
            username: body.username as string,
            password: hashedPwd,
            zip_code: body.zip_code as string,
            phone: body.phone as string,
            email: body.email as string
        }
        const result = await UserModel.newUser(newUser);
        if (result.rowCount == 1){
            return c.redirect('/login.html');
        } else {
            return c.json({ error: 'No se puedo insertar el registro' }, 400);
        }
        
    }

    static async deleteUser(c:Context){
        const userToDeleteId = parseInt(c.req.param("id"));
        
        try {
            //llamar al modelo para que borre y recibir respuesta
            const result = await UserModel.deleteUser(userToDeleteId);
            
            if (result.rowCount > 0) {
                return c.json({ success: true, message: 'Usuario eliminado correctamente' });
            } else {
                return c.json({ success: false, message: 'No se pudo borrar el usuario' }, 404);
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return c.json({ success: false, message: 'Error interno del servidor' }, 500);
        }
    }

    static async updateUser(c:Context){
       
        const body = await c.req.parseBody();
        const userToUpdateId = c.req.param("id");
        
        // Validar que los campos requeridos estén presentes
        if (!body.username || !body.zip_code || !body.phone || !body.email || !body.role) {
            return c.json({ success: false, message: 'Faltan campos requeridos' }, 400);
        }
        const currentTimestamp = new Date().toISOString();
        const params: (string|File)[] = [body.username, body.zip_code, body.phone, body.email, body.role, currentTimestamp, userToUpdateId];

        
        try {
            const result = await UserModel.updateUser(params);

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
    

