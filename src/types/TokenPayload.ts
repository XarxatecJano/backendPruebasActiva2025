import { JwtPayload } from "jsonwebtoken"

interface TokenPayload extends JwtPayload {
    username: 'string',
    role: 'string'
}

export {TokenPayload}