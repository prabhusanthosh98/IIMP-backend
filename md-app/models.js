'use strict';


const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AlertSchema = new Schema({
    address: {
        name: {
            type: String,
            required: true
        },
        street_address: {
            type: String,
            required: true
        },
        suburb: {
            type: String,
            required: true
        },
        postcode: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            required: true
        }
    },
    location: {
        latitude: {
            type: String
        },
        longitude: {
            type: String
        }
    },
    video_url: {
        type: String
    },
    image_url: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    },
    uuid: {
        type: String,
        required: true,
        // unique: true
    },
    type: {
        type: Boolean,
        required: true,
        default: true
    },
    provider: {
        type: String,
        required: true
    },
    alerted: {
        type: Date,
        required: true,
        default: Date.now
    },
    reponded: {
        type: Date
    }
});


// mongoose.model('alerts', AlertSchema, 'intrusion_details');
mongoose.model('alerts', AlertSchema, 'intrusion_details');
