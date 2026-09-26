 
function populatedb (){
    var uniquestring=[1,2,3,4,5,6,7,8,9,0,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
    
    var uniqueid=()=>{
        for(let i=0;i<uniquestring.length;i++){
            var randommathvalue=Math.random();
            return randommathvalue;
        }
    }

    console.log(uniqueid())




    const mysql = require('mysql2');


    console.log(  
       `host:${ process.env.DB_HOST},
        port:${ process.env.DB_PORT},
        port: ${parseInt(process.env.DB_PORT)},
        user: ${process.env.DB_USER},
        password: ${process.env.DB_PASSWORD},
        database: ${process.env.DB_NAME},
        ssl: {
            rejectUnauthorized: false} // Required for Aiven cloud SSL connections
        }
    })`)





    const con = mysql.createConnection({
    host: process.env.DB_HOST || "localhost"    ,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "easyClicksDatabase",
    family: 4,                // Forces IPv4 lookup to bypass cloud container IPv6 routing timeouts
    connectTimeout: 120000,    // Increases timeout window to 20 seconds
    ssl: {
        rejectUnauthorized: false
    }
    });

    con.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to Aiven MySQL successfully!');
    });




















 








    con.connect(function(err) {
      console.log("table creation con error for db connection",err)
      if (err) throw err;
     
      async function createSqlTables(){

          try{
            var createuserstable=`CREATE TABLE IF NOT EXISTS users(
                user_id VARCHAR(255) PRIMARY KEY, 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255),
                password VARCHAR(255), 
                phonenumber INT(255), 
                role JSON, 
                address VARCHAR(255),
                status VARCHAR(255),
                verification_code VARCHAR(255),   
                access_token VARCHAR(255),
                refresh_token VARCHAR(255)   
            )`

            var createlandlordstable= `CREATE TABLE IF NOT EXISTS landlords(
                landlord_id VARCHAR(255) PRIMARY KEY, 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255), 
                phonenumber INT(255), 
                address VARCHAR(255),
                user_id VARCHAR(255),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            );`


            var createcaretakerstable=`CREATE TABLE IF NOT EXISTS caretakers(
                caretaker_id VARCHAR(255) PRIMARY KEY, 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255), 
                phonenumber INT(255), 
                address VARCHAR(255),
                user_id VARCHAR(255),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
    
            var createagentstable=`CREATE TABLE IF NOT EXISTS agents(
                agent_id VARCHAR(255) PRIMARY KEY, 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255), 
                phonenumber INT(255), 
                address VARCHAR(255),
                user_id VARCHAR(255),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
    
    
            var createtanantstable=`CREATE TABLE IF NOT EXISTS tenants(
                tenant_id INT PRIMARY KEY, 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255),
                id_number INT, 
                phonenumber INT(255), 
                address VARCHAR(255),
                user_id VARCHAR(255),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
            
            var createserviceproviderstable=`CREATE TABLE IF NOT EXISTS serviceproviders(
                service_provider_id VARCHAR(255) PRIMARY KEY,
                service_provided VARCHAR(255), 
                first_name VARCHAR(255), 
                last_name VARCHAR(255), 
                email VARCHAR(255), 
                phonenumber INT(255), 
                address VARCHAR(255),
                user_id VARCHAR(255),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
    
            var createapartmentimagestable=`CREATE TABLE IF NOT EXISTS apartmentimages(
                image_id VARCHAR(255) PRIMARY KEY, 
                property_id VARCHAR(255), 
                image_view VARCHAR(255), 
                image_status VARCHAR(255), 
                image_path VARCHAR(255),
                
                FOREIGN KEY(property_id) REFERENCES properties(property_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
    
            var createunitstable=`CREATE TABLE IF NOT EXISTS units(
                unit_id INT AUTO_INCREMENT PRIMARY KEY,
                unit_type VARCHAR(255),
                unit_price INT(255),
                unit_number VARCHAR(255),
                
                property_id VARCHAR(255),
                tenant_id INT(255),

                FOREIGN KEY(tenant_id) REFERENCES tenants(tenant_id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY(property_id) REFERENCES properties(property_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`


            var createunitsimagestable=`CREATE TABLE IF NOT EXISTS unitsimages(
                image_id VARCHAR(255) PRIMARY KEY, 
                property_id VARCHAR(255), 
                image_view VARCHAR(255), 
                image_status VARCHAR(255), 
                image_path VARCHAR(255),
                unit_id INT,

                FOREIGN KEY(unit_id) REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY(property_id) REFERENCES properties(property_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;


            // var createpropertiestable=`CREATE TABLE IF NOT EXISTS properties(
            //     property_id VARCHAR(255) PRIMARY KEY,
            //     user_id VARCHAR(255), 
            //     property_name VARCHAR(255), 
            //     total_units INT(255),
            //     available_units INT(255),
            //     property_type VARCHAR(255),
            //     listing_purpose VARCHAR(255), 
            //     internal_features_per_unit JSON,
            //     apartment_external_features JSON,
            //     apartment_features_nearby JSON,
            //     apartment_rooms_per_unit JSON,
            //     prices_per_unit JSON,
                
            //     landlord_id VARCHAR(255),
            //     caretaker_id VARCHAR(255),
            //     service_provider_id VARCHAR(255),
              
            //     FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
            //     FOREIGN KEY(landlord_id) REFERENCES landlords(landlord_id) ON UPDATE CASCADE ON DELETE CASCADE,
            //     FOREIGN KEY(caretaker_id) REFERENCES caretakers(caretaker_id) ON UPDATE CASCADE ON DELETE CASCADE,
            //     FOREIGN KEY(service_provider_id) REFERENCES serviceproviders(service_provider_id) ON UPDATE CASCADE ON DELETE CASCADE
    
            // )`;

            var createpropertiestable=`CREATE TABLE IF NOT EXISTS properties(
                property_id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255), 
                property_name VARCHAR(255), 
                total_units INT(255),
                available_units INT(255),
                property_type VARCHAR(255),
                listing_purpose VARCHAR(255), 
                internal_features_per_unit JSON,
                apartment_external_features JSON,
                apartment_features_nearby JSON,
                apartment_rooms_per_unit JSON,
                prices_per_unit JSON,

                property_latitude DECIMAL(10,7),
                property_longitude DECIMAL(10,7),
                property_address VARCHAR(500) NULL,
                property_place_id VARCHAR(255) NULL,
                
                landlord_id VARCHAR(255),
                caretaker_id VARCHAR(255),
                service_provider_id VARCHAR(255),
            
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY(landlord_id) REFERENCES landlords(landlord_id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY(caretaker_id) REFERENCES caretakers(caretaker_id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY(service_provider_id) REFERENCES serviceproviders(service_provider_id) ON UPDATE CASCADE ON DELETE CASCADE

            )`;
                
            
            var createaccesstokenstable=`CREATE TABLE IF NOT EXISTS accesstokens(
                accesstoken_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255),
                accesstoken VARCHAR(1024),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;
           

            var createrefreshtokenstable=`CREATE TABLE IF NOT EXISTS refreshtokens(
                refreshtoken_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255),
                refreshtoken VARCHAR(1024),
                FOREIGN KEY(user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE
            )`;


            // await(createuserstable);
            // await(createlandlordstable);
            // console.log("tables created sucessfully")

            con.query(createuserstable, function(error,results){
                if (error){
                    console.log(error);
                    console.log("error right here")
                    console.log(this.sql)
                    // throw err;
                }
                else{
                    console.log("userss table successfully created");
                    console.log(results);   
                }
            });

            
            con.query(createlandlordstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;
        
                }
                else{
                    console.log("Landlords table  table successfully created");
                    console.log(results);   
                }
            });


            
            con.query(createcaretakerstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;
        
                }
                else{
                    console.log("caretakers table successfully created");
                    console.log(results);   
                }
            });

            con.query(createagentstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("agents table successfully created");
                    console.log(results);   
                }
            });

            con.query(createtanantstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Tenants table successfully created");
                    console.log(results);   
                }
            });
            
            con.query(createserviceproviderstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("serice provider table successfully created");
                    console.log(results);   
                }
            });


            con.query(createpropertiestable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Properties table successfully created");
                    console.log(results);   
                }
            });

            con.query(createapartmentimagestable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Apartements Images table successfully created");
                    console.log(results);   
                }
            });

            con.query(createaccesstokenstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Access Tokens table successfully created");
                    console.log(results);   
                }
            });

            con.query(createrefreshtokenstable, function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Refesh Tokens table successfully created");
                    console.log(results);   
                }
            });
          

            con.query(createunitstable,function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Refesh Tokens table successfully created");
                    console.log(results);   
                }
            }) 
            


            con.query(createunitsimagestable,function(error,results){
                if (error){
                    console.log(error);
                    // throw err;

                }
                else{
                    console.log("Refesh Tokens table successfully created");
                    console.log(results);   
                }
            })
           
       
           
        }
        catch(error){
            console.log(error);

        }
     
      }
      createSqlTables();

  
    
        

        
    });

}


module.exports=populatedb;
