const Categories = require('../models/category');
const User = require('../models/user');
const State = require('../models/state');
const Ad = require('../models/ad');


const dotenv = require('dotenv');
dotenv.config();
const { v4: uuidv4 } = require('uuid');

const { Mongoose, ObjectId, isValidObjectId } = require('mongoose');
const jimp = require('jimp');


const addImage = async (buffer) => {
    let newName = `${uuidv4()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
}




module.exports = {
    getCategories: async (req, res) => {
        const cats = await Categories.find();
        let category = [];

        for (let i in cats) {
            category.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            })
        }
        res.json({ category })
    },
    addAction: async (req, res) => {

        let { title, price, priceneg, desc = '', cat, token } = req.body;


        const userToken = await User.findOne({ token }).exec();

        if (!userToken) {
            res.json({ error: "Usuário não encontrado" });
            return;
        };
        if (!title || !cat) {
            res.json({ error: "Dados obrigatorios" });
            return;
        };
        if (price) {
            price = price.replace('.', '').replace(',', '.');
            price = parseFloat(price);
        } else {
            price = 0;
        }


        let newAd = Ad();

        let catego = await Categories.findById(cat).exec();


        newAd.category = catego._id.toString();
        newAd.status = true;
        newAd.idUser = userToken._id;
        newAd.state = userToken.state;
        newAd.title = title;
        newAd.price = price;
        newAd.description = desc;
        newAd.dateCreated = new Date();
        newAd.views = 0;
        newAd.priceNegotiable = (priceneg == 'true') ? true : false;


        if (req.files && req.files.img) {
            if (req.files.img.length == undefined) {

                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    newAd.images.push({
                        url,
                        default: false
                    });
                }
            } else {

                for (let i = 0; i < req.files.img.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {

                        let url = await addImage(req.files.img[i].data);
                        newAd.images.push({
                            url,
                            default: false
                        })
                    }
                }

            }

        } else {
            newAd.images.push({
                url: `defaultImg.jpg`,
                default: false
            });
        }

        if (newAd.images.length > 0) {
            newAd.images[0].default = true;
        }

        let info = await newAd.save();
        res.json({ id: info._id });


    },
    getList: async (req, res) => {
        let token = '';
        token = req.body.token || req.query.token;

        let { sort = 'asc', offset = 0, limit = 8, q, cat, state } = req.query;
        let filters = { status: true };

        if (q) {
            filters.title = { '$regex': q, '$options': 'i' };
        };

        if (cat) {
            const c = await Categories.findOne({ slug: cat }).exec();
            if (c) {
                filters.category = c._id.toString();
            };
        };

        if (state) {
            const s = await State.findOne({ name: state.toUpperCase() }).exec();
            if (s) {
                filters.state = s._id.toString();
            };
        };
        let adsTotal = await Ad.find(filters).exec();
        let total = adsTotal.length;


        let ads = await Ad.find(filters)
            .sort({ dateCreated: (sort == 'desc') ? -1 : 1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();

        let simpleAds = [];

        for (let i in ads) {
            let image;
            let defaultImage = ads[i].images.find(e => e.default);

            if (defaultImage) {
                image = `${process.env.BASE}/media/${defaultImage.url}` || `http://localhost:5000/media/${defaultImage.url}`;
            } else {
                image = `${process.env.BASE}/media/defaultImg.jpg` || `http://localhost:5000/media/defaultImg.jpg`;
            }

            simpleAds.push({
                id: ads[i]._id,
                title: ads[i].title,
                price: ads[i].price,
                priceneg: ads[i].priceNegotiable,
                desc: ads[i].description,
                status: ads[i].status,
                image,
                cat: ads[i].category
            })
        }
        res.json({ simpleAds, total, token })
    },
    getItem: async (req, res) => {
        let { id, other = null } = req.query;

        if (!id || isValidObjectId(id) == false) {
            res.json({ error: 'sem id ou id incorreto.' });
            return;
        }
        let ad;


        if (isValidObjectId(id)) {
            ad = await Ad.findById(id);

            if (!ad) {
                res.json({ error: 'ad nao encontrado!' });
                return;
            }

            ad.views++;
            await ad.save();


        }
        let images = [];
        if (ad.images.length > 0) {
            for (let i in ad.images) {
                images.push(`${process.env.BASE}/media/${ad.images[i].url}` || `http://localhost:5000/media/${ad.images[i].url}`)
            }
        } else {
            images.push(`${process.env.BASE}/media/defaultImg.jpg`) || `http://localhost:5000/media/defaultImg.jpg`;
        }

        let category = await Categories.findById(ad.category).exec();
        let userInfo = await User.findById(ad.idUser).exec();
        let stateInfo = await State.findById(ad.state).exec();

        let others = [];
        if (other) {

            const otherAd = await Ad.find({ status: true, idUser: ad.idUser }).exec();
            for (let i in otherAd) {

                if (otherAd[i]._id.toString() != ad._id.toString()) {
                    let image = `${process.env.BASE}/media/defaultImg.jpg`|| `http://localhost:5000/media/defaultImg.jpg`;
                    let defautImage = otherAd[i].images.find(e => e.default);
                    if (defautImage) {
                        image = `${process.env.BASE}/media/${defautImage.url}`|| `http://localhost:5000/media/${defautImage.url}`;
                    }

                    others.push({
                        id: otherAd[i]._id,
                        title: otherAd[i].title,
                        price: otherAd[i].price,
                        priceNegotiable: otherAd[i].priceNegotiable,
                        image
                    })
                }
            }
        }
        let adItem = {
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category: category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            stateName: stateInfo,
            others
        }


        res.json({ adItem });
        return;
    },
    editAction: async (req, res) => {
        let { id } = req.params;
        let { token, price, priceNegotiable, title, cat, desc, status } = req.body;
        let { images } = req.files
        if (id) {
            if (id.length < 12) {
                res.json({ error: 'id incorreto' });
                return;
            }
        }

        const ad = await Ad.findById(id).exec();
        if (!ad) {
            res.json({ error: 'ad inexistente' });
            return;
        }

        const user = await User.findOne({ token }).exec();
        if (ad.idUser !== user._id.toString()) {
            res.json({ error: 'anuncio nao e do usuario' });
            return;
        }

        let updates = {};

        if (title) {
            updates.title = title;
        }
        if (price) {
            if (price) {
                price = price.replace('.', '').replace(',', '.');
                price = parseFloat(price);
            } else {
                price = 0;
            }
            updates.price = price;
        }
        if (status && status == 'true' || status == 'false') {
            updates.status = status;
        }
        if (priceNegotiable && priceNegotiable == 'true' || priceNegotiable == 'false') {
            (priceNegotiable == 'true') ? updates.priceNegotiable = true : updates.priceNegotiable = false;
        }
        if (desc) {
            updates.desc = desc;
        }
        if (cat) {
            const catego = await Categories.findOne({ slug: cat }).exec();
            if (catego) {
                updates.cat = catego._id.toString();
            }
        }

        //images

        let updateImages = [];
        if (req.files && req.files.images) {
            if (req.files.images.length == undefined) {

                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.images.mimetype)) {
                    let url = await addImage(req.files.images.data);
                    updateImages.push({
                        url,
                        default: false
                    });
                }
            } else {

                for (let i = 0; i < req.files.images.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.images[i].mimetype)) {

                        let url = await addImage(req.files.images[i].data);
                        updateImages.push({
                            url,
                            default: false
                        })
                    }
                }

            }

        }

        if (updateImages.length > 0) {
            updateImages[0].default = true;
        }

        if (images) {
            updates.images = updateImages;
        }
        await Ad.findByIdAndUpdate(id, { $set: updates })

        res.json({
            updates
        })
    }
}