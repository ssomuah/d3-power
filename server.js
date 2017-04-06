var express = require('express')
var app = express()
var sqlite3 = require('sqlite3').verbose();
var moment = require('moment')
var db = new sqlite3.Database('plugload.db')

app.use('/public',express.static('public'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

//power_readings (hashed_apt_num text, apt_class int, timestamp integer, power real, UNIQUE(hashed_apt_num, timestamp))''')
app.get('/data',function(req,res){
    //get query string
    var apt = req.query.apt
query ='SELECT sum(s1.power) as power,s2.avg as avg, s1.new_stamp as timestamp FROM  (SELECT apt_class,strftime("%Y-%m-%d %H:00",timestamp,"unixepoch")as new_stamp,power from power_readings ' 
query+='WHERE hashed_apt_num=$apt) AS s1 JOIN(SELECT apt_class,strftime("%Y-%m-%d %H:00",timestamp,"unixepoch")as new_stamp,avg(power) as avg FROM power_readings'
query+=' group by new_stamp,apt_class  )as s2 ON s1.new_stamp =s2.new_stamp and s1.apt_class=s2.apt_class group by timestamp'

//query ='SELECT s1.timestamp as timestamp ,s1.power as power,s2.avg as avg FROM  (SELECT apt_class,timestamp,power from power_readings ' 
//query+='WHERE hashed_apt_num=$apt) AS s1 JOIN(SELECT apt_class,timestamp,avg(power) as avg FROM power_readings'
//query+=' group by timestamp,apt_class  )as s2 ON s1.timestamp =s2.timestamp and s1.apt_class=s2.apt_class'

//query ='SELECT strftime("%Y-%m-%d %H:00",timestamp,"unixepoch")as new_stamp from power_readings limit 5'
    db.all(query,{$apt:apt},function(err,rows){
    //db.all(query,function(err,rows){
        if(err){
            console.log(err)
            console.log(err.stack)
            return res.status(500).send(err)
        }
        //
        //we have 
        res.send(rows)
    })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})