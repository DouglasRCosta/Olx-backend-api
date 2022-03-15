const User = require('../models/user');
module.exports = {
    private: async (req, res, next) => {
    
        if (!req.query.token && !req.body.token) {
            res.json({ notAllowed: true });
            
            return;
        };

        let token = '';

        (req.query.token) ? token = req.query.token : null;
        (req.body.token) ? token = req.body.token : null;

        if (token == '' || token == undefined || token == null) {
            res.json({ notAllowed: true });
            return;
        };
        let user = await User.findOne({
           token    
        });
        if(!user){
            res.json({ notAllowed: true });
            return;
        }
        next();
    }
};