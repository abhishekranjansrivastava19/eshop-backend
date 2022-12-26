const {Product} = require("../models/product");
const express = require("express");
const router = express.Router();
const { Category } = require("../models/category")
const mongoose = require("mongoose");
const multer = require("multer");


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('inValid image type');

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, "public/Uploads")
    },
    file: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}'-'${Date.now()}.${extension}`)
    }
})
const uploadOptions = multer({ storage: storage });




router.get(`/`, async (req, res) => {
    // http://localhost:3000/api/v1/products?categories=2356487,354275885

    let filter = {};
    if (req.query.categories)
    {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate("category"); 
    res.send(productList);
    if (!productList) {
        res.status(500).json({ sucess: false });
    }
});




router.get('/:id', async (req, res) => {
    const products = await Product.findById(req.params.id).populate("category");
    
    if (!products) {
        res.status(500).json({ sucess: false })
    }
    res.send(products)
})




router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("invalid category");

    const file = req.file;
    if (!file) return res.status(400).send("no image in the request");

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    
    const products = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescripion,
        image: `${basePath}${fileName}`, // 'http://localhost:3000/public/uploads/image-2323232',
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numberReviews: req.body.numberReviews,
        isFeatured: req.body.isFeatured,
    })
    products = await products.save(); 
    if (!products) {
        return res.status(500).send("the product cannot be created!");
    }
        res.send(products);
})




router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
         res.status(404).send("invalid product Id!")
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("invalid category")

    const products = await Product.findById(req.params.id);
    if (!products) return res.status(400).send("inValid product!");

    const file = req.file;
    let imagepath;
    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath=`${basePath}${fileName}`
    } else {
        imagepath = products.image;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescripion,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numberReviews: req.body.numberReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )
    if (!updatedProduct) 
        return res.status(500).send("the product cannot be updated!")
    res.send(updatedProduct)
})




router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(products => {
        if (products) {
            return res.status(200).json({ sucess: true, message: "the product is deleted!" })
        } else {
            return res.status(404).json({ sucess: false, message: "the product is not found" })
        }
    }).catch(err => {
        return res.status(400).json({sucess: false, error: err})
    })
})




router.get(`/get/count`, async (req, res) => {
    const count = req.params.count
    const productCount = await Product.countDocuments(count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})




router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})



router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(404).send("invalid product Id!")
        }

        const files = req.files
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map(file => {
            imagesPaths.push(`${basePath}${file.fileName}`);
            })
        }
        const products = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            {new:true}
        )
    if (!products) 
        return res.status(500).send("the product cannot be updated!")
    res.send(products)
    }
)



module.exports = router;

