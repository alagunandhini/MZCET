const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
        type: String,
        required: true,
    },

    registerNumber: {
        type: String,
        required: true,
        unique: true,
    },

    department: {
        type: String,
        default: "",
    },

    email: {
        type: String,
        unique: true,
        sparse: true,
    },

    password: {
        type: String,
        required: true,
    },

    isFirstLogin: {
        type: Boolean,
        default: true,
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
    // tracks how many times each round has been submitted/graded, e.g. { Round1: 2, Round2: 0 }
    roundAttempts: {
        type: Object,
        default: {}
    },

    // tracks time spent (in seconds) on the most recent attempt of each round, e.g. { Round1: 142 }
    roundTimeTaken: {
        type: Object,
        default: {}
    },



});

module.exports = mongoose.model("user", userSchema);