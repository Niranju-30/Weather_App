const mongoose=require('mongoose');

const historySchema=new mongoose.Schema({
    city_name:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
})
const historyModel=mongoose.model("History",historySchema);
module.exports=historyModel;