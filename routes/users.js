var express = require('express');
var router = express.Router();

const validator = require('email-validator');
const axios = require('axios');

var User = require('../models/User').User;
var config = require('../config/config');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', (req, res) => {
    const email = req.body.email;
    const wallet = req.body.wallet;
    const name = req.body.name;
    if(!validator.validate(email) || !wallet || !name) {
        res.status(400).json({
            message : "이메일, 주소 또는 이름을 확인해주세요."
        });
    } else {
        User.findOne({wallet : wallet}, (err, user) => {
            if(user) {
                res.status(404).json({message : '이미 존재하는 사용자입니다!'});
            } else {
                var newUser = new User({
                    email : email,
                    wallet : wallet,
                    name : name
                });
                newUser.save();
                res.status(200).json({
                    message : '계정 생성에 성공하였습니다!',
                    user : newUser
                });
            }
        });
    }
});

router.post('/wallet/create', (req, res) => {
    var server_address;
    var server_private_key;
    var server_mnemonic;

    axios.post('http://purplebeen.kr:2442/api/v1/wallet')
        .then(response => {
            server_address = response.data.address;
            server_private_key = response.data.privateKey;
            server_mnemonic = response.data.mnemonic;
            axios.post('http://purplebeen.kr:2442/api/v1/signedtx', {
                privateKey : config.wallet.admin_privateKey,
                from : config.wallet.admin_address,
                to : server_address,
                amount : 1000,
                fee : 0.0001
                }).then(response => {
                    console.log('test');
                    console.log(response.data);
                    res.status(200).json({
                        message : 'success',
                        wallet : {
                            server_wallet : server_address,
                            server_private_key : server_private_key,
                            server_mnemonic : server_mnemonic
                        }
                    });
                }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.get('/wallet/get/:address', (req, res) => {
    var address = req.params.address;
    console.log(address);
    var url = `http://purplebeen.kr:2442/api/v1/wallet/${address}/balance`;
    console.log(url);
    User.findOne( {wallet : address}, (err, user) => {
        if(user) {
            axios.post(`http://purplebeen.kr:2442/api/v1/wallet/${address}/balance`)
                .then(response => {
                    res.status(200).json({
                        email : user.email,
                        wallet : user.wallet,
                        balance : response.data.balance,
                        entered_wallet : user.entered_wallet
                    });
                });
        } else {
            res.status(404).json({message : "not found"})
        }
    });
});

module.exports = router;
