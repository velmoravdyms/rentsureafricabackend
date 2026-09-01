
// var mysql = require('mysql2');
  

// function connectDatabase(){
        
//     // var mysql = require('mysql');
    
//     var con = mysql.createConnection({
//         host: "localhost",
//         user: "root",
//         password: "password",
//         database:'easyClicksDatabase',
//     });

//     return con;

// }

// module.exports= connectDatabase;







var mysql = require('mysql2');

function connectDatabase() {
    var con = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || 'easyClicksDatabase',
        ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return con;
}

module.exports = connectDatabase;




    
    
// con.connect(function(err) {
//     if (err){ 
//             throw err;
//     }
//     else{
//         // async function createSqlTables(){
//         //     try{
//         //     }
//         //     catch(error){
//         //         console.log(error);
//         //     }
//         // }
//         console.log("sucessfully conected to database for QUERYING")
//         const connect=query
//     }
// })










// con.query(createcaretakerstable, function(error,results){
//     if (error){
//         console.log(error);
//         // throw err;

//     }
//     else{
//         console.log("caretakers table successfully created");
//         console.log(results);   
//     }
// });


    