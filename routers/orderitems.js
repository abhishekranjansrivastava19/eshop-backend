const orderitem = require("../models/orderitem");
const express = require("express");
const models = require("mongoose");
const router = express.Router();


router.get(`/`, async (req, res) => {
    const orderitemList = await orderitem.find();
    res.send(orderitemList);
    if (!orderitemList) {
        res.status(500).json({ sucess: false });  
    }
})

router.post(`/`, (req, res) => {
    const orderitem = new orderitem({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock
    })
    orderitem.save().then((createdorderitem => {
        res.status(201).json({createdorderitem});
    })).catch((err => {
        res.status(500).json({
            error: err,
            sucess: false
        })
    }))
})

module.exports = router;