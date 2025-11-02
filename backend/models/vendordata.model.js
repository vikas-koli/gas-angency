const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const vendorSupplierSchema = new Schema({
    party_name: {
        type: String,
        required: [true, "Please enter party name"],
        trim: true
    },
    no_of_tanki: {
        type: Number,
        required: [true, "Please enter number of tanki"],
        min: [0, "Number of tanki cannot be negative"]
    },
    empty_tanki_return: {
        type: Number,
        default: 0,
        min: [0, "Empty tanki return cannot be negative"]
    },
    total_amount: {
        type: Number,
        required: [true, "Please enter total amount"],
        min: [0, "Total amount cannot be negative"]
    },
    online_payment: {
        type: Number,
        default: 0,
        min: [0, "Online payment cannot be negative"]
    },
    cash_payment: {
        type: Number,
        default: 0,
        min: [0, "Cash payment cannot be negative"]
    },
    remaining_payment: {
        type: Number,
        default: 0,
        min: [0, "Remaining payment cannot be negative"]
    },
    
    payment_date: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String,
        trim: true
    },
    deleteFlag: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VendorSupplier', vendorSupplierSchema);

