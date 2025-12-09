import { getCookie } from "hono/cookie"
import jwt from 'jsonwebtoken';
import { TokenPayload } from "../types/TokenPayload.js";
import { MiddlewareHandler } from "hono";

export const sessionParser: MiddlewareHandler = async (c, next) => {
    
    if(c.req.header('Cookie')){
        const token = getCookie(c, 'token');
        const decodedToken: TokenPayload = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET) as TokenPayload;
        c.set('username', decodedToken.username);
        c.set('role', decodedToken.role);
    }

    await next();

}

export const isAdmin: MiddlewareHandler = async (c, next) => {
    const role = c.get('role');

    if (!role) {
        c.status(401);
        c.header('Location', '/login.html?error=sesion');
        return c.body(null);
    }

    if (role !== 'admin') {
        c.status(403);
        c.header('Location', '/home.html?error=permisos');
        return c.body(null);
    }

    await next();
}

