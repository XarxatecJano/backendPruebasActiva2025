import { newUserDTO, User } from "../types/User.js";
import { poolActiva } from "../config/db.js";

export class UserModel {
    static async findUsers(): Promise<User[]> {
       let users: User[];
       try{
            const result = await poolActiva.query('SELECT * FROM "User"');
            users = result.rows;
             

       } catch(error:any){
            console.error(`Error en findUsers: ${error.message}`);
       
       }
       return users;
        
    }

    static async newUser(userData: newUserDTO) {
        const query = `INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ($1, $2, $3, $4, $5)`;
        const params = [userData.username, userData.password, userData.phone, userData.email, userData.zip_code];
        const result = await poolActiva.query(query, params);
        return result;
    }

    static async deleteUser(id:number){
        const query = `DELETE FROM "User" WHERE id = $1`;
        const params = [id]
        const result = await poolActiva.query(query, params);
        return result;
    }

    static async updateUser(params: (string|File)[]){
        const query = `UPDATE "User" SET username = $1, zip_code = $2, phone = $3, email = $4, role = $5, updated_at = $6 WHERE id = $7`;
        const result = await poolActiva.query(query, params);
        return result;
    }

}