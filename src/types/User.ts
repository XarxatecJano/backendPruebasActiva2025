export interface User {
    id: number,
    username: string,
    password: string,
    created_at: Date,
    updated_at:Date,
    zip_code: string,
    phone: string,
    email: string,
    role:string
}

export interface newUserDTO {
    username: string,
    password: string,
    zip_code: string,
    phone: string,
    email: string
}