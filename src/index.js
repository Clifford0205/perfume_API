const mysql=require('mysql');
const express=require('express');
const bodyparser=require('body-parser');
const moment = require('moment-timezone');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const session = require('express-session');


var app=express();

// 查看 HTTP HEADER 的 Content-Type: application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({extended: false}));

// 查看 HTTP HEADER 的 Content-Type: application/json
app.use(bodyparser.json());

app.use(express.static('public'))


var whitelist = ['http://localhost:5555', 'http:// 192.168.1.111:5555', undefined,'http://localhost:3000'];
var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        console.log('origin: '+origin);
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};
app.use(cors(corsOptions));




const upload = multer({dest: 'tmp_uploads/'});

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'sdgdsf ;ldkfg;ld',
    cookie: {
        maxAge: 1800000
    }
}));



var mysqlConnection=mysql.createConnection({
    host:'localhost',
    user:'clifford',
    password:'12345',
    database:'perfume',
    multipleStatements:true

});

mysqlConnection.connect((err)=>{
    if(!err)
        console.log('DB connection succeded');
    else
        console.log('DB connection failed \n Error:'+JSON.stringify(err,undefined,2));
})




//專案



//拿到會員資料

app.get('/memberdata',(req,res)=>{
    mysqlConnection.query('SELECT*FROM member ',(err,rows,fields)=>{
        for(let s in rows){
            rows[s].m_birthday=moment(rows[s].m_birthday).format('YYYY-MM-DD');
            rows[s].buy_record=JSON.parse(rows[s].buy_record);
            rows[s].shopping_cart=JSON.parse(rows[s].shopping_cart);
        }
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
});


//會員註冊
app.post('/memberdata',(req,res)=>{
    console.log(req.body);
    body=req.body; 
    var sql="INSERT INTO `member` SET ?";
    mysqlConnection.query(sql,body,(err,rows,fields)=>{
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
});


//會員登入
app.post('/login',(req,res)=>{
    console.log(req.body);
    body=req.body; 
    let data={
        passed:false,
        message:'帳號或密碼錯誤',
        body:''
    }
    var sql="SELECT * FROM `member` WHERE `m_mail`=? AND `m_password`=?";
    mysqlConnection.query(sql,[body.login_email,body.login_password],(err,rows,fields)=>{
        if(rows.length!==0){   
            for(let s in rows){
                rows[s].m_birthday=moment(rows[s].m_birthday).format('YYYY-MM-DD');
                rows[s].buy_record=JSON.parse(rows[s].buy_record);
                rows[s].shopping_cart=JSON.parse(rows[s].shopping_cart);
            }        
            data.passed=true;
            data.message='正確';
            data.body=rows;
            res.send(data);
        }else{
            res.send(data);
        }
    })
});

//重新抓取會員資料
app.post('/memberagain',(req,res)=>{
    console.log(req.body);
    body=req.body; 
    let data={
        body:''
    }
    var sql="SELECT * FROM `member` WHERE `m_sid`=?";
    mysqlConnection.query(sql,body.m_sid,(err,rows,fields)=>{

        if(!err) {                 
            rows[0].m_birthday=moment(rows[0].m_birthday).format('YYYY-MM-DD');
            rows[0].buy_record=JSON.parse(rows[0].buy_record);
            rows[0].shopping_cart=JSON.parse(rows[0].shopping_cart);          
            res.send(rows);
        }   
        else
        console.log(err);
    })
});

//會員資料修改
app.put('/memberdata/edit/:id',(req,res)=>{
    // console.log(req.body);
    // console.log(req.params.id);
    thebody=req.body; 

    let data={
        passed:false,
        message:'資料沒有修改',
        body:''
    }
    var sql="UPDATE `member` SET ? WHERE `m_sid`=?";    
    mysqlConnection.query(sql,[thebody,req.params.id],(err,rows,fields)=>{
        // if(!err)
        // res.send(rows);
        // else
        // console.log(err)
        if(rows.changedRows===1){     
            data.passed=true;
            data.message='正確';
            data.body=thebody;
            res.send(data)
        }             
        else{
            res.send(data);
        }
      
    })
});


//會員密碼修改
app.put('/memberdata/password/:id',(req,res)=>{
    // console.log(req.body);
    // console.log(req.params.id);
    thebody=req.body; 

    let data={
        passed:false,
        message:'資料沒有修改',
        body:''
    }
    var sql="UPDATE `member` SET ? WHERE `m_sid`=?";    
    mysqlConnection.query(sql,[thebody,req.params.id],(err,rows,fields)=>{
        
        if(rows.changedRows===1){
            data.passed=true;
            data.message='正確';
            data.body=thebody;
            res.send(data)
        }             
        else{
            res.send(data);
        }
      
    })
});

//加到購物車
app.put('/memberdata/addcart/:id',(req,res)=>{
    console.log(req.body);
    // console.log(req.params.id);
    thebody=req.body; 

    let data={
        passed:false,
        message:'資料沒有修改',
        body:''
    }
    var sql="UPDATE `member` SET ? WHERE `m_sid`=?";    
    mysqlConnection.query(sql,[thebody,req.params.id],(err,rows,fields)=>{
         if(!err)
        res.send(rows);
        else
        console.log(err);    
    })
});

//從購物車刪除
app.patch('/memberdata/removecart/:id',(req,res)=>{
    console.log(req.body);
    // console.log(req.params.id);
    thebody=req.body; 

    let data={
        passed:false,
        message:'資料沒有修改',
        body:''
    }
    var sql="UPDATE `member` SET ? WHERE `m_sid`=?";    
    mysqlConnection.query(sql,[thebody,req.params.id],(err,rows,fields)=>{
         if(!err)
        res.send(rows);
        else
        console.log(err);    
    })
});

//購物車到訂單
app.patch('/memberdata/inorder/:id',(req,res)=>{
    console.log(req.body);
    // console.log(req.params.id);
    thebody=req.body; 

    let data={
        passed:false,
        message:'資料沒有修改',
        body:''
    }
    var sql="UPDATE `member` SET ? WHERE `m_sid`=?";    
    mysqlConnection.query(sql,[thebody,req.params.id],(err,rows,fields)=>{
         if(!err)
        res.send(rows);
        else
        console.log(err);    
    })
});




// 拿到所有產品資料
app.get('/products',(req,res)=>{
    mysqlConnection.query('SELECT*FROM products ',(err,rows,fields)=>{
        for(let s in rows){
            rows[s].message=JSON.parse(rows[s].message);
            rows[s].chinese=JSON.parse(rows[s].chinese);
            rows[s].english=JSON.parse(rows[s].english);
            rows[s].imglist=JSON.parse(rows[s].imglist);
        }
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
});

//大留言
app.patch('/products/bigmsg/:id',(req,res)=>{
    console.log(req.body);   
    body=req.body;
    var sql="UPDATE `products` SET message=? WHERE `p_sid`=?";
    mysqlConnection.query(sql,[JSON.stringify(body),req.params.id],(err,rows,fields)=>{     
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
})

//送出顧客意見
app.post('/clientmessage',(req,res)=>{
    console.log(req.body);
    body=req.body; 
    var sql="INSERT INTO `message` SET ?";
    mysqlConnection.query(sql,body,(err,rows,fields)=>{
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
});


//小留言
app.patch('/products/littlemsg/:id',(req,res)=>{
    console.log(req.body);   
    body=req.body;
    var sql="UPDATE `products` SET message=? WHERE `p_sid`=?";
    mysqlConnection.query(sql,[JSON.stringify(body),req.params.id],(err,rows,fields)=>{ 
        if(!err)       
        res.send(rows)
        else
        console.log(err);
    })
})



//專案




app.listen(5001, ()=>{
    console.log('server running');
});

