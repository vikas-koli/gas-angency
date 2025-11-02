const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const adminSchema = mongoose.Schema({
    admin_Name: {
        type: String,
        required: [true, "please enter admin name"],
    },
    admin_Email: {
        type: String,
        required: [true, "please enter admin email"],
    },
    password: {
        type: String,
        required: [true, "please enter password"]
    },

    deleteFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('admin', adminSchema);