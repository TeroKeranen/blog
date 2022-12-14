// require express
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))


app.get('/', (req,res) => {
    res.render('index', {title: 'All blogs'});
})

app.get('/about', (req,res) => {
    res.render('about', {title: 'About'})
})





app.listen(3000, function () {
    console.log('Server started on port 3000')
})