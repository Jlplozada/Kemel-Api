import connection from "../utils/db.js"

export class usuarios{
    static async findByEmail(email){
        const [rows]= await db.query("SELECT * FROM usuarios WHERE correo = ?",[
            email,
        ]);
        return rows[0];
    }
    static async create (nombre,email,hashedPassword){
        console.log(nombre,email,hashedPassword);
        const [result]=await db.query(
            "INSERT INTO usuarios(nombre,correo,clave) VALUES(?,?,?)",
            [nombre,email,hashedPassword]
        );
        return result.insertId;
    }
    static async updateRefreshToken(id,refreshToken){
        await db.query("UPDATE usuarios SET refresh_token=? WHERE id =?",[
            refreshToken,
            id,
        ]);
    }
}
