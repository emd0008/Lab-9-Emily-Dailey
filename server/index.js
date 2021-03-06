var http = require('http');
var url = require("url");
var fs = require("fs");
var path = require("path");

let serverDir = path.join(__dirname, "../server");
let clientDir = path.join(__dirname, "../client");

let server = http.createServer((req, res) => {
    let parsedUrl =  url.parse(req.url, true);
    let parsedJSON = '/server/data.json';
    fs.readFile('index.html', function(err, data){
        if(parsedUrl.pathname === '/' && req.method === 'GET'){
            res.writeHead(200, {"Content-Type": "text/html"});
            let rs = fs.createReadStream(path.join(clientDir, "index.html"));
            return rs.pipe(res);
        }
        else if(parsedUrl.pathname === '/api/chirps'){
            if(req.method === "GET"){
                let rs = fs.createReadStream(path.join(serverDir, "data.json"));
                res.writeHead(200, {"Content-Type": "application/json"});                
                return rs.pipe(res);
            }
            else if(req.method === "POST"){
                let incomingData = '';
                req.on('data', function(chuck){
                    incomingData += chuck;
                });
                req.on('end', function(){
                    let newChirp = JSON.parse(incomingData);
                    fs.readFile(path.join(serverDir, 'data.json'), 'utf8', (err, data) => {
                        if(err){
                            console.log(err);
                        }else{
                            let chirpsArray = JSON.parse(data);
                            chirpsArray.push(newChirp);

                            fs.writeFile(path.join(serverDir, 'data.json'), JSON.stringify(chirpsArray), (err) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    res.writeHead(201);
                                    return res.end();
                                }
                            });
                        }
                    });
                });
            }
        }else{
            let pathInfo = path.parse(parsedUrl.pathname);
            if(pathInfo.base === "styles.css"){
                let rs = fs.createReadStream(path.join(clientDir, "styles.css"));
                res.writeHead(200,  {"Content-Type": "text/css"});
                return rs.pipe(res);
            }else if(pathInfo.base === "scripts.js"){
                let rs = fs.createReadStream(path.join(clientDir, "scripts.js"));
                res.writeHead(200, {"Content-Type": "text/javascript"});
                return rs.pipe(res);
            }else if(pathInfo.base === "index.html"){
                let rs = fs.createReadStream(path.join(clientDir, "index.html"));
                res.writeHead(200, {"Content-Type": "text/html"});
                return rs.pipe(res);
            }else{
                res.writeHead(404, {"Content-Type": "text/plain"});
                return res.end("404 Not Found");
            }
        }
    });
});
server.listen(3000);