const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const { getWeather, getHistory, deleteHis } = require('./controller/weather');
const DBConnect = require('./db/dbConnect');
const cors=require('cors');
app.use(cors());
DBConnect();
app.get("/getWeather/:city",getWeather);
app.get("/getHistory",getHistory);
app.delete("/delete",deleteHis);
app.use(bodyparser());
app.use(express.json());
app.listen(8000,()=>{
console.log("Server starting");
});