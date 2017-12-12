let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
    chat_id:{
        type:String,
        required:true,
    },
    from_id:{
        type:String,
        required:true,
    },
    text:String,
    date:{
        type:Date,
        required:true
    },
    checked : {
        type:Boolean,
        default: false
    }
});

module.exports = mongoose.model("message",MessageSchema);