var express = require('express');
var router = express.Router();
var axios = require('axios');

const Funding = require('../models/Funding').Funding;

//funding 생성
//funding 조회
//funding 하기
//내가 펀딩한거 조회

router.post('/create', (req, res) => {
    if(!(req.files && req.files.image)) {
        res.status(400).json({message : '이미지 파일을 넣어주세요!'});
    } else {
        var data = JSON.parse(req.body.data);
        console.log(data);
        console.log(!data.description)
        req.files.image.mv(`${__dirname}/../public/images/${data.title}.jpg`, (err) => {
            if(!err) {
                if (!data.title || !data.description || !data.title.trim() || !data.description.trim()) {
                    res.status(400).json({message : "빠진 부분이 있습니다."});
                } else {
                    axios.post('http://purplebeen.kr:2442/api/v1/wallet')
                        .then(response => {
                            const server_wallet = response.data.address;
                            const server_private_key = response.data.privateKey;
                            const server_mnemonic = response.data.mnemonic;
                            const opened_name = response.data.name;
                            const opened_wallet = response.data.wallet;
                            var member = [{name : opened_name, wallet : opened_wallet}];
                            var newFunding = new Funding({
                                title: data.title,
                                description: data.description,
                                server_wallet: server_wallet,
                                server_private_key: server_private_key,
                                server_mnemonic: server_mnemonic,
                                members : member
                            });
                            newFunding.save();
                            res.status(200).json({message : "펀딩 생성에 성공하였습니다."});
                        });
                }
            } else {
                res.status(500).json({message : "이미지 업로드중 오류가 발생하였습니다!"});
            }
        });
    }
});

module.exports = router;