var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const app = require('../app');

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "screl"
});
db.connect((err) => {
  if (err) throw err;
  console.log("connected to database")
})

/* GET home page. */
router.get('/', function (req, res) {
  let user = req.session.user
  if (user) {
    let name = user.name
    let id = user.id
    db.query("select * from " + name + id + " ", function (err, result) {
      if (err) throw (err);
      req.session.count = result.length
    })
  }

  db.query("select * from webb", (err, result) => {
    if (err) throw (err);
    let count = req.session.count
    if (count) {
      res.render('userheader', { data: result, user, count });
    } else {
      let count = null
      res.render('userheader', { data: result, user, count });
    }
  })
})
router.get('/admin', function (req, res) {
  // let user = req.session.user
  db.query("select * from webb", (err, result,) => {
    if (err) throw (err);
    res.render('adminheader', { data: result })
  })
})
router.get('/add', function (req, res) {
  res.render('addproduct')
})
router.post('/save', function (req, res) {
  console.log(req.body)
  console.log(req.files.image)
  let sql = "insert into webb(name,category,price,discription,image)value('" + req.body.name + "','" + req.body.category + "','" + req.body.price + "','" + req.body.discription + "','" + req.files.image + "')"

  db.query(sql, function (error, result) {
    if (error)
      throw error
    let image = req.files.image
    let id = result.insertId
    image.mv('public/images/' + id + '.jpg')
    console.log('data send')
    res.redirect('/admin')

  })
})
router.get('/edit/:Id', function (req, res) {
  var thisId = req.params.Id;
  db.query("select * from webb where id='" + thisId + "'", (err, result,) => {
    if (err) throw (err);
    res.render('edit', { data: result[0] })
  })

})
router.post('/update', function (req, res) {
  var user = req.body.id;
  let sql = "update  webb set name='" + req.body.name + "',category='" + req.body.category + "',price='" + req.body.price + "',discription='" + req.body.discription + "'where id='" + user + "'"
  db.query(sql, function (error) {
    if (error)
      throw error
    console.log('data send')
    res.redirect('/admin')

  })
})
router.get('/delete/:Id', function (req, res) {
  var thisId = req.params.Id;
  db.query("DELETE from webb where id='" + thisId + "'", (err, result,) => {
    if (err) throw (err);
    res.redirect('/admin')
  })

})
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
})
router.get('/signup', function (req, res) {
  res.render('signup')
})
router.post('/signupp', function (req, res) {

  let name = req.body.name

  let sql = "insert into wee(name,surname,email,phoneno,password)value('" + req.body.name + "','" + req.body.surname + "','" + req.body.email + "','" + req.body.phoneno + "','" + req.body.password + "')"
  db.query(sql, function (error, result) {
    if (error)
      throw error
    else if (result) {

      db.query("select * from wee where name='" + name + "'", (err, result) => {
        if (err) throw (err)
        let id = result[0].id
        if (id) {
          let sql = "create table " + name + id + "(id int auto_increment primary key ,name varchar(500),category varchar(500),price varchar(500),discription varchar(500),image varchar(500))"
          db.query(sql, function (err, result) {
            if (err)
              throw err
            console.log('table created')
          })
        }
        let sql = "create table " + name + id + id + "(id int auto_increment primary key ,name varchar(500),email varchar(500),number varchar(500),address varchar(500),city varchar(500),state varchar(500),pin varchar(500))"
        db.query(sql, function (err, result) {
          if (err)
            throw err
          console.log('table created')

          res.redirect('/login')
        })
      })
    }
  })

})
router.post('/login', function (req, res) {
  let Email = req.body.email
  let Password = req.body.password
  if (Email && Password) {
    let sql = 'select * from wee where email=? and password=?'
    db.query(sql, [Email, Password], function (err, result) {

      if (err) throw err

      if (result.length > 0) {

        req.session.loggedIn = true
        req.session.user = result[0]
        res.redirect('/')
      }
      else {
        req.session.loginErr = true
        res.redirect('/login')
      }
    })
  }
})
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart', function (req, res) {
  let user = req.session.user
  if (user) {
    let name = user.name
    let id = user.id
    db.query("select * from " + name + id + " ", function (err, result) {
      if (err) throw (err);
      let sql = "select sum(price)from " + name + id + " "
      db.query(sql, function (err, results) {
        if (err) throw (err)
        let value = results[0]
        let total = value['sum(price)']

        // let count = req.session.count
        res.render('cart', { data: result, user, total });

      })



    })
  } else
    res.redirect('/login')
})

router.get('/addtocart/:id', function (req, res) {
  var thisId = req.params.id
  var user = req.session.user
  if (user) {
    var cartname = user.name
    var cartid = user.id
    db.query("select * from webb where id='" + thisId + "'", function (err, result) {
      if (err) throw (err);
      var data = result[0]
      let sql = "insert into " + cartname + cartid + "(name,category,price,discription,image)value('" + data.name + "','" + data.category + "','" + data.price + "','" + data.discription + "','" + thisId + "')"
      db.query(sql, function (err, result) {
        if (err) throw err
        res.redirect("/")
      })
    })
  } else {
    res.redirect('/login')
  }
})
router.get('/remove/:id', function (req, res) {
  let Id = req.params.id
  let user = req.session.user
  let name = user.name
  let idd = user.id
  let sql = "delete from " + name + idd + " where id='" + Id + "' "
  db.query(sql, function (err, result) {
    if (err) throw (err)
    res.redirect('/cart')


  })
})


router.get('/placeorder', function (req, res) {
  user = req.session.user
  let name = user.name
  let id = user.id
  db.query("select * from " + name + id + " ", function (err, result) {
   if (err) throw err
    let sql = "select sum(price)from " + name + id + " "
    db.query(sql, function (err, results) {
      if (err) throw (err)
      let value = results[0]
      let total = value['sum(price)']
      let count = req.session.count
      if (err) throw (err);
      let da=req.session.address
      
      res.render('placeorder', { data:result,da,user, total,count })
    })
  })
})
router.get('/payment',function(req,res){
let user=req.session.user
res.render('payment',{user})
})
  router.get('/profile',function(req,res){
    let user = req.session.user
    res.render('profile',{user})
  })
  router.get('/addaddress',function(req,res){
    let user=req.session.user
    res.render('addaddress',{user})
  })
  router.post('/address',function(req,res){
    let user = req.session.user
    let id = user.id
    let name = user.name
    let sql = "insert into " + name + id + id + "(name,email,number,address,city,state,pin)values('" + req.body.name + "','" + req.body.email + "','" + req.body.number + "','" + req.body.address + "','" + req.body.city + "','" + req.body.state + "','" + req.body.pin + "')"
    db.query(sql, function (err, result) {
      if (err) throw err                                      
      res.redirect('/selectaddress')

    })

  })
 router.get('/selectaddress',function(req,res){
   user = req.session.user
    let id = user.id
    let name = user.name
  db.query("select * from " + name + id + id + " ", function (err, results) {
    if (err) throw (err);
    // console.log(results[0]);
    let data=results
    
  res.render('selectaddress',{data,user})
  })
 }) 
  router.get('/select/:id',function(req,res){
 let selectid=req.params.id
 let user = req.session.user
    let id = user.id
    let name = user.name
    db.query("select * from " + name + id + id + " where id="+selectid+" ", function (err, results) {
      if (err) throw (err);
     
     
      req.session.address= results[0]
      res.redirect('/placeorder')
    })
  })
  router.get("/editaddress/:id",function(req,res){
    let editid=req.params.id
    let user = req.session.user
    let id = user.id
    let name = user.name
    db.query("select * from " + name + id + id + " where id="+editid+" ", function (err, result) {
      if (err) throw (err);
   
      res.render('editaddress',{user,da:result[0]})
      })
    
    })
  router.post('/updatead', function (req, res) {
   
    let user = req.session.user;
    let id = user.id
    let name = user.name
    let sql = "update   "+ name + id + id +" set name='" + req.body.name + "',email='" + req.body.email + "',number='" + req.body.number + "',address='" + req.body.address + "',city='" + req.body.city + "',state='" + req.body.state + "',pin='" + req.body.pin + "'where id='" +req.body.id+ "'"
    db.query(sql, function (error,result) {
      if (error)
        throw error
      
      console.log('data send')
      res.redirect('/selectaddress')
  
    })
  })
  router.get('/deletead/:Id', function (req, res) {
    var thisId = req.params.Id;
      let id = user.id
    let name = user.name
    db.query("DELETE from " + name + id + id + " where id="+thisId+" ", function (err, result) {
      if (err) throw (err);
      res.redirect('/selectaddress')
    })
    })
  
  
  module.exports = router;