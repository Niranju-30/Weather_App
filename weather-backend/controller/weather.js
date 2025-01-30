const historyModel = require("../models/searchHistory");
const api_key = "701f0bb470967b6cda6638b1b0cad81d";

exports.getWeather = async (req, res) => {
  const city = req.params.city;
  await historyModel.create({city_name:city});
  
  if (!city) {
    return res.status(400).json({ message: "City namerequired" });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      return res.status(404).json({ message: "City not found" });
    }

    res.status(200).json({
      data
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getHistory=async(req,res)=>{

const weather=await historyModel.find();
  res.status(200).json({
    weather
  })
}

exports.deleteHis=async(req,res)=>{
  await historyModel.deleteMany();
  res.status(200).json({
    message:"Delete successfully"
  })
}