var express = require('express');
var router = express.Router();
var axios = require('axios');

const Funding = require('../models/Funding').Funding;
const User = require('../models/User').User;

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
                                open_name : opened_name,
                                open_wallet : opened_wallet,
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

router.get('/get/:wallet', (req, res) => {
    const wallet = req.params.wallet;
    Funding.findOne({server_wallet : wallet}, (err, funding) => {
        if(!funding) {
            res.status(404).json({message : "펀딩이 없습니다."})
        } else {
            res.json({message : "펀딩 조회에 성공했습니다!", funding: funding});
        }
    });
});

router.get('/get_all', (req, res) => {
    Funding.find({}, (err, fundings) => {
        if(!fundings) {
            res.status(404).json({message : "펀딩이 없습니다."})
        } else {
            res.json({message : "펀딩 조회에 성공했습니다", fundings : fundings});
        }
    })
});

router.post('/funding', (req, res) => {
    var name = req.body.name;
    var from_wallet = req.body.server_wallet;
    var from_private_key = req.body.server_privateKey;
    var walletAddress = req.body.to_wallet;
    var amount = req.body.amount;

    User.findOne({wallet : from_wallet}, (err, user) => {
        if(user) {
            Funding.findOne({server_wallet: walletAddress}, (err, funding) => {
                if (!funding) {
                    res.status(404).json({message: "해당하는 펀딩을 찾을 수 없습니다."});
                } else {
                    axios.post('http://purplebeen.kr:2442/api/v1/signedtx', {
                        privateKey: from_private_key,
                        from: from_wallet,
                        to: walletAddress,
                        amount: amount,
                        fee: 0.0001
                    }).then(response => {
                        console.log('test');
                        console.log(response.data);
                        axios.get(`http://purplebeen.kr:2442/api/v1/wallet/${walletAddress}/balance`)
                            .then(response => {
                                var member = {name: name, wallet: walletAddress};
                                console.log(member);
                                funding.members.push(member);
                                funding.save();
                                var wallet = {wallet : walletAddress};
                                user.enteredWallet.push(wallet);
                                user.save();
                                res.status(200).json({
                                    message: "펀딩에 성공하였습니다!",
                                    wallet: walletAddress,
                                    balance: response.data.balance,
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    });
                }
            })
        } else {
            res.status(404).json({message : "사용자를 찾을 수 없습니다!"});
        }
    })

});



module.exports = router;