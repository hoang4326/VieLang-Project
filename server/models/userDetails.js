const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    username: String,
    password: String,
    role: String

},{
    collection: "UserInfo",
});

mongoose.model("UserInfo", UserDetailsSchema);