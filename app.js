const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const user = require('./routes/user');
const kota = require('./routes/kota');

const database = require('./util/database');
const initializeDefaultUser = require('./helper-function/initialize-default-user');

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', user);
app.use('/api/kota', kota);

database.getConnection().then(() => {
  console.log('Database ewali connected');
  initializeDefaultUser(); // clear db, dan create admin default
  app.listen(port, () => {
    console.log('Server ewali is listening to port ' + port);
  });
}).catch(err => console.log('Error connecting database', err));