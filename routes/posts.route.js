const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js")
const { Posts } = require("../models/posts.js")
const { Op } = require("sequelize");


// 게시글 생성 POST : localhost:3018/api/posts
router.post("/posts", authMiddleware, async (req, res) => {
    //게시글을 생성하는 사용자 정보 (사용자인증 미들웨어)
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.create({
        UserId: userId,
        title, 
        content,
    });
    return res.status(201).json({
        data: post,
        message: "게시글이 생성되었습니다."
    })

});



// 게시글 목록 조회 GET : localhost:3018/api/posts
router.get("/posts", async (req, res) => {
    const posts = await Posts.findAll({
        attributes: ['postId', 'title', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({data: posts});
})



// 게시글 상세 조회 GET : localhost:3018/api/posts/postId
router.get("/posts/postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({
        attributes : ['postId', 'title', 'content', 'createdAt', 'updatedAt'],
        where: { postId }
    });
    return res.status(200).json({data: post});
})



// 게시글 수정 PUT : localhost:3018/api/posts/postId
router.put("/posts/postId", authMiddleware, async(req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.findOne({where: { postId }});

    if(!post){
        return res.status(404).json({
            errorMessage: "게시글이 존재하지 않습니다."
        })
     } else if (userId !== post.userId){
        return res.status(404).json({
            errorMessage: "게시글 수정 권한이 없습니다."
        })
     }

     await Posts.update(
        { title, content }, // title과 content의 컬럼을 수정
        {
            where : {
                [Op.and]: [{postId}, {UserId: userId}], // Op.and = &&같은 의미. 그리고
            }
        }
     );
        return res.status(200).json({
            message: "게시글이 수정되었습니다."
        })
})



// 게시글 삭제
router.delete("/posts/postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const post = await Posts.findOne({ where : {postId}});

    if (!post) {
        return res.status(404).json({
            errorMessage: "게시글이 존재하지 않습니다."
        })
    } else if (userId !== post.userId) {
        return res.status(404).json({
            errorMessage: "게시글 삭제 권한이 없습니다."
        })
    }

    await Posts.destroy({
        where: {
            [Op.and]: [{postId}, {UserId: userId}],
        }
    });
    return res.status(200).json({
        message: "게시글이 삭제되었습니다."
    })

})





module.exports = router;