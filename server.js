const express = require('express');
const bodyParser = require('body-parser');

//set up the app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use((req, res, next) => {
  next();
});

app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/erx', {
	useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected");
}).catch(err => {
  console.log(err);
});

const PORT = 3018
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
