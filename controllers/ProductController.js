const errorHandler = require('../shared/utils/errorHandler');
const Product = require('../models/Product');
const fs = require('fs');


// token -- distributor
module["exports"].getDistributorProducts = async function (request, response) {
    try {
        const products = await Product.find({distributor: request.distributor._id});
        response.status(200).json({
            success: true,
            message: 'Success',
            products
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- client
// distributor -- params
module["exports"].getClientProducts = async function (request, response) {
    try {
        if (!request.client.distributors.includes(request.params.distributor)) {
            return response.status(200).json({
                success: false,
                message: 'Client does not subscribed to this distributor'
            });
        }
        const products = await Product.find({distributor: request.params.distributor});
        response.status(200).json({
            success: true,
            message: 'Success',
            products
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// MainAdmin
module["exports"].create = async function (request, response) {
    try {
        const product = new Product({
            distributor: request.distributor._id,
            name: request.body.name,
            image: request.file ? request.file.path : null,
            price: request.body.price,
            description: request.body.description
        });

        await product.save();

        response.status(200).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token,
// name
// image
// price,
// description,
module["exports"].updateById = async function (request, response) {
    try {
        const product = await Product.findOne({_id: request.params.product, distributor: request.distributor._id});
        if (!product) {
            return response.status(409).json({success: false, message: 'Product not found'});
        }

        if (request.body.name) product.name = request.body.name;
        if (request.body.price) product.price = request.body.price;
        if (request.body.description) product.description = request.body.description;
        if (request.file) {
            const image = product.get('image', null, {getters: false});
            if (image) fs.unlinkSync(image);
            product.image = request.file.path;
        }
        await product.save();


        response.status(200).json({success: true, message: 'Product updated successfully', product});
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token,
// product
module["exports"].deleteById = async function (request, response) {
    try {
        const product = await Product.findOneAndDelete({
            _id: request.params.product,
            distributor: request.distributor._id
        });
        const image = product.get('image', null, {getters: false});
        if (image) fs.unlinkSync(image);
        const success = !!product;
        response.status(200).json({
            success,
            message: success ? 'Product deleted successfully' : 'Product not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};
