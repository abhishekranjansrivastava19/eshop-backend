const {Category} = require("../models/category");
const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

router.get(`/`, async (req, res, next) => {
    const categoryList = await Category.find();
    res.send(categoryList);
    if (!categoryList) {
        res.send(500).json({ sucess: false });
    }
    res.status(200).send(categoryList);
    next.send(categoryList);
});



router.get(`/:id`, async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({message:"the category with the given id was not found."})
    }
    res.status(200).json(category);
    next();
})


router.post(`/`, (req, res, next) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        colour: req.body.colour
    })
    category.save().then((createdcategory => {
        res.status(201).json(createdcategory)
    })).catch((err) => {
        res.status(500).json({
            error: err,
            sucess: false
        })
    })
    next();
})



router.put(`/:id`, async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            colour:req.body.colour
        },
        { new: true },
    )

    if (!category) 
        return res.status(400).send("the category cannot be created!")
    
        res.send(category)
        next();
})



router.delete(`/:id`, (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ sucess: true, message: "the category is deleted!!" })
        } else {
            return res.status(404).json({ sucess: false, message: "category not found"})
        }
    }).catch(err => {
        return res.status(400).json({ sucess: false, error: err })
    })
})



module.exports = router;
