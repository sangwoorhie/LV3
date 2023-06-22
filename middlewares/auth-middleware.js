const jwt = require("jsonwebtoken");
const userinfos = require("../models/userinfos.js");
const { Users } = require("../models/users.js")

module.exports = async(req, res, next) => {
    const { Authorization } = req.cookies;
    const [ tokenType, token ] = (Authorization ?? "").split(" ")
    if(tokenType !== "Bearer"){
        res.status(401).json({
            errorMessage: "토큰 타입이 일치하지 않습니다."
        });
    } else if (!token) {
        res.status(401).json({
            errorMessage: "토큰이 존재하지 않습니다."
        });
    }
    try{
        const decodedToken = jwt.verify(token, "customized_secret_key") // 복호화된 정보에서 userId 갖고옴
        const userId = decodedToken.userId; // jwt만들었을때 (users.route.js) 저장된 userId를 변수 할당

        const user = await userinfos.findOne({ // 몽구스의 사용자인증미들웨어랑 다른 부분은 여기밖에 없음. where절
            where: {userId}
        });
        if (!user || !userId){
            return res.status(401).json({
                errorMessage: "토큰에 해당하는 사용자가 존재하지 않습니다."
            })
        }
        res.locals.user = user;
        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            errorMessage: "비정상적인 접근입니다."
        });
    }


}   