import jwt  from "jsonwebtoken"


export const Generate_JWT = (payload, exp)=>{
    return jwt.sign(payload, process.env.SECRET, { expiresIn: exp });
}


