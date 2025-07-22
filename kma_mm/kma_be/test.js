const express = require('express');
const app = express();
const port = 8080;

app.get('/account/admin', (req, res)=> {
    res.send('hello world');
    res.send('<a href="https://www.google.com.vn/?hl=vi">google')});

app.listen(port,()=> console.log(`server http://localhost:${port}`));