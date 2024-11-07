const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 4000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.use("/", require("./routes/countryRoute"));

app.use("/api/v1", (req, res) => {
  res.status(200).json({ message: "api connected" });
});


app.all("*", (req, res) => {
  res.status(404);

  res.sendFile("views/404.html", { root: __dirname });
  throw new Error("Route Not Found");
});
// app.use(errorhandler);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});