const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    resumeText: {
        type: String,
        default: "",
    },

    jobDescription: {
        type: String,
        default: "",
    },

    questions: {
        type: Object,
        default: {},
    },

    hasResume: {
        type: Boolean,
        default: false,
    },

    completedRounds: {
        type: [String],
        default: [],
    },
    
    roundResults: {
    type: Object,
    default: {}
},

});

module.exports = mongoose.model("user", userSchema);