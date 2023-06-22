const express = require("express")
const { Users, UserInfos } = require("../models");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { Op } = require('sequelize');


// 1. 회원가입 POST : localhost:3018/api/users
router.post("/users", async (req, res) => {
    const { email, password, name, age, gender, profileImage } = req.body;
    const isExistUser = await Users.findOne({
        where: {
            email: email, // where조건문
        }
    });
    // email과 동일한유저가 존재할때 에러발생
    if(!isExistUser) {
        return res.status(400).json({
            errorMessage:"이미 존재하는 이메일입니다."
        });
    }
    // 사용자 테이블에 데이터 삽입
    const user = await Users.create({ email, password })

    // 사용자 정보 테이블에 데이터를 삽입
    // 어떤 사용자의 사용자정보인지 내용이 필요
    await UserInfos.create({ 
        userId : user.userId, // 위에 변수 생성된 user에 userId값 할당해서 넣어줌
        name, age, gender, profileImage 
    });
    return res.status(201).json({
        message: "회원가입이 완료되었습니다."
    });
})



// 2. 로그인 POST : localhost:3018/api/login
router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await Users.findOne({
        where: {email}
    });

    // 1. 해당하는 사용자가 존재하는가
    // 2. 해당하는 사용자의 비밀번호가 존재하는가
    if(!user) {
        return res.status(401).json({
            errorMessage: "해당하는 사용자가 존재하지 않습니다."
        })
    } else if (user.password !== password) {
        return res.status(401).json({
            errorMessage: "비밀번호가 일치하지 않습니다."
        })
    }
       
    //jwt 생성
    const token = jwt.sign({
        userId: user.userId
    }, "customized_secret_key");

    //쿠키 발급
    res.cookie("Authorization", `Bearer ${token}`);
    return res.status(200).json({
        message: "로그인에 성공하였습니다."
    });
})



// 3. 사용자 조회 GET : localhost:3018/users/:userId
router.get('/users/:userId', async(req, res) => {
    const { userId } = req.params;

    // 사용자 테이블, 사용자 정보 테이블
    const user = await Users.findOne({
        attribute: ['userId', 'email', 'createdAt', 'updatedAt'], // 이것들만 선택, attribute = select문
        includes: [  // includes:관계를 맺고있는 다른 테이블들을 조회 (시퀄라이즈 finder매서드)
            {
                model: UserInfos, // UserInfos 모델 (몽구스로 치면 스키마)에서 아래항목들을 조회한다
                attributes: ['name', 'age', 'gender', 'profileImage'],
            }
        ]
    });
    return res.status(200).json({data: user});


})




module.exports = router;































