import { User } from "../types/User.js";
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

}