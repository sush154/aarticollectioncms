var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer = require('multer')
    fs = require('fs');

app.use(bodyParser.json());

var config = {
    client : {
        connectionUrl : ['http://localhost:3000', 'http://localhost:8100', 'https://aarticollectionadminui.herokuapp.com/', 'http://localhost:4200']
    }
}

app.use(function(req, res, next){
    var origin = req.headers.origin;
    if(config.client.connectionUrl.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }

    //res.header("Access-Control-Allow-Origin", config.client.connectionUrl);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    /*if((req.session.cookie._expires > (new Date())) && req.cookies.token){
      next();
    } else {
      res.cookie("token", "", { expires: new Date() });
      return res.json({data: {status : 401}});
    }*/
    next();
});

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');


app.post('/saveImage', function(req, res){
    upload(req,res,function(err){

        console.log(req.file);

        if(err){
             return res.json({error_code:1,err_desc:err});
        }else {

            let imagePath = req.file.filename;

            return res.json({data: {status: 200, imagePath : imagePath}});

        }

    });
});

app.get('/getImg/:imagePath', function(req, res){
    res.set('Content-Type', 'image/*');
    //res.send(fs.readFileSync('./uploads/file-1514958738002.jpg'));
    let imageDir = "./uploads/"+req.params.imagePath;
    fs.readFile(imageDir, function(err, content){
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/*'});
            res.end(content);
        }
    });
});

var port = process.env.PORT || 9003;

app.listen(port, function(){
    console.log("app is listening on port 9003");

});