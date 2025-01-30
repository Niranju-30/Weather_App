const mongoose=require('mongoose');

const DBConnect=async()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/weatherHistory", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
})
console.log("DB Connected ")
};
module.exports=DBConnect;

