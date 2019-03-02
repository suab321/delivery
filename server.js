const express=require('express');
const bodyparser=require('body-parser');
const app=express();

const {auth_route}=require('./authentication/authenticate');


app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.set('view engine','ejs');
app.use(express.static('views'))


app.use('/authentication',auth_route);

app.listen(process.env.PORT || 3002);



