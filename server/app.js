// require("@babel/register")({
//     presets: ["@babel/preset-env", "@babel/preset-react"],
//     "plugins": [
//       [
//         "transform-assets",
//         {
//           "extensions": [
//             "css",
//             "svg",
//             "png",
//           ],
//           "name": "static/media/[name].[hash:8].[ext]"
//         }
//       ]
//     ]
//   });
  
//   require("dotenv").config()
//   // const mongoose= require("mongoose")
//   const express = require("express")
//   const createError= require("http-errors")
//   const helmet= require("helmet")
//   const compression= require('compression') 
//   const path= require("path")
//   const cors=require("cors")
//   const multer=require("multer")
//   const fs=require("fs");
//   const axios=require("axios");

//   const app= express()
//   app.use(express.json())


//   corsOptions=cors({
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
//     "Access-Control-Allow-": "Authorization, Content-Type",
//     "Access-Control-Allow-Credentials": "true"
//   });

//   app.use(corsOptions);

//   const auth=require("../middlewares/authentification")
//   const cookieParser = require("cookie-parser")
  

//   //set the roots to be used for the app
//   const oAuth2=require("../oauthcallback");
//   const refreshTokens=require("../routes/tokensRouter")
//   const loginRouter= require ("../routes/loginRouter")
//   // const indexRouter= require("../routes/indexRouter")
//    const signupRouter= require("../routes/signupRouter")
//   const verifyemailRouter=require("../routes/verifyemailRouter")
//   // const passwordresetRouter= require("../routes/passwordresetRouter")
//   const propertyManagerRouter= require("../routes/propertymanagerRouter")





//   //const landLordRouter= require("./routes/landlordRouter")
//   //const tenantRouter= require("./routes/tenantRouter")
//   //const maintenanceRouter= require("./routes/maintenanceRouter")
  
  
//    //Mysql connection starts here 
//    var populatedDatabase= require("../populatedb");
//    populatedDatabase();
   
 
  

//   //Middlewares
//   //body parser and urlencode
//   app.use(express.urlencoded({extended:false}))

//   //set views and public folder for use
//   //app.set(express.static(path.join(__dirname, "public")))
//   app.set("views", path.join(__dirname, 'views'))
//   app.set("view engine", "ejs")
  

//   //use url paths as middlewares
//   //  app.use("/", indexRouter)
//   // app.use("/o/auth/passwordreset",  passwordresetRouter)
//   app.use("/o/auth/login",   loginRouter)
//   app.use("/o/auth/verify", verifyemailRouter)
//   app.use("/o/auth/signup",  signupRouter)
//   app.use("/o/auth/refreshtokens", refreshTokens);
//   app.use("/oauthcallback", oAuth2);
  
//   app.use(auth);
 
//   app.use("/properties", propertyManagerRouter)
  
//   /*app.use("/landlord", landLordRouter)
  
//   app.use("/tenant", tenantRouter)
//   app.use("/maintenance", maintenanceRouter)
//   */
  
  
//   //middlewares
//   app.use(compression())
//   app.use(helmet())
//   app.use(cookieParser())
  
  
//   // Example using Express.js
//   app.get('/oauthcallback', (req, res) => {
//   console.log('OAuth Callback Request:', req.query);
//   // Handle code exchange here
//   });


//   const generateAccessToken = async () => {
//     const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate";
//     const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

//     try {
//       const { data } = await axios.get(url, {
//         headers: { Authorization: `Basic ${auth}` },
//       });
//       return data.access_token;
//     } catch (error) {
//       console.error("OAuth Error:", error.response?.data || error.message);
//       return null;
//     }
    
//   }



//   app.post("/stk-push", async (req, res) => {
//     const accessToken = await generateAccessToken();
//     if (!accessToken) return res.status(500).send("Failed to get token");

//     const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
//     const password = Buffer.from(`${process.env.MPESA_PAYBILL}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

//     const payload = {
//       BusinessShortCode: process.env.MPESA_PAYBILL,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: "CustomerPayBillOnline",
//       Amount: 5000, // Example rent amount
//       PartyA: process.env.TENANT_MPESA_PHONE_NUMBER,
//       PartyB: process.env.MPESA_PAYBILL,
//       PhoneNumber: process.env.TENANT_MPESA_PHONE_NUMBER,
//       CallBackURL: process.env.MPESA_CALLBACK_URL,
//       AccountReference: "Rent Payment",
//       TransactionDesc: "Payment for Apartment 101",
//     };

//     try {
//       const { data } = await axios.post(
//         "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
//         payload,
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       res.json(data);
//     } catch (error) {
//       console.error("STK Push Error:", error.response?.data || error.message);
//       res.status(500).send("Failed to initiate payment");
//     }
//   });




//   app.post("/callback", (req, res) => {
//     console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));

//     const { Body } = req.body;
//     if (Body?.stkCallback?.ResultCode === 0) {
//       const metadata = Body.stkCallback.CallbackMetadata.Item.reduce((acc, item) => {
//         acc[item.Name] = item.Value;
//         return acc;
//       }, {});

//       console.log("✅ Payment Success:", metadata);
//     } else {
//       console.log("❌ Payment Failed:", Body.stkCallback.ResultDesc);
//     }

//     res.sendStatus(200);
//   });



//   app.use(express.static(path.join(__dirname, "../pmsclient", "build")));
//   app.use(express.static((path.join(__dirname, "public" ))));




//   //********************Multiple uploads for Multer Handle Multiple Image Uploads*************
//   const upload = multer({ dest: "uploads/" }); // Temp folder
//   const BUNNY_STORAGE_URL = "https://storage.bunnycdn.com/rentsureafricaimages-storage/";
//   const BUNNY_ACCESS_KEY = "e82ef1ca-9a92-4cb2-bf148d33df4c-2d2c-4d0d";
 
  
//   app.post("/upload", upload.array("images", 20), async (req, res) => {
//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({ success: false, message: "No files uploaded empty Request " });
//         }

//         console.log("Here are the image files " ,req.files);
//         const imageUrls = await uploadToBunny(req.files);
//         // res.json({ success: true, urls: req.files });
//         res.json({message:"successfully recieved your sent photos", success: true,urls:imageUrls });

        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
//   });


  
//   // Upload to Bunny.net (Mehrere Dateien)
//   const uploadToBunny = async (files) => {
//     let uploadedImages = [];

//     console.log("Here we are in the Bunny SHit")

//     for (let file of files) {
//         const filePath = file.path;
//         const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
//         const fileData = fs.readFileSync(filePath);


//         console.log("file path",filePath);

//         console.log("file Name",fileName);
//         console.log("file Data",fileData);

//         try {
//             await axios.put(
//                 `${BUNNY_STORAGE_URL}${fileName}`,
//                 fileData,
//                 {
//                     headers: {
//                         "AccessKey": BUNNY_ACCESS_KEY,
//                         "Content-Type": "application/octet-stream",
//                     },
//                 }
//             );

//             uploadedImages.push(`https://rentsureafrica-pullzone.b-cdn.net/ /${fileName}`); // CDN URL speichern


            
            
//         } catch (error) {
//             console.error(`Fehler beim Hochladen von ${fileName}:`, error.response?.data || error.message);
//         } finally {
//             fs.unlinkSync(filePath); // Temp-Datei löschen
//         }
//     }

//     console.log("uploaded images here is the LIst  ", uploadedImages);

//     return uploadedImages;
//   };

 
//   const port= process.env.PORT || 8000;
//   app.listen(port, ()=>{`${console.log(`The PMS Server has successfully started in Port ${port}`)}`})

































  require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    [
      "transform-assets",
      {
        extensions: ["css", "svg", "png"],
        name: "static/media/[name].[hash:8].[ext]",
      },
    ],
  ],
});

require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const app = express();

// 1. Global Security, Compression & Parsing Middleware (MUST be at top)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



corsOptions=cors({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-": "Authorization, Content-Type",
  "Access-Control-Allow-Credentials": "true"
});

app.use(corsOptions);



// // CORS configuration
// const corsOptions = {
//   origin: process.env.CLIENT_URL || "*",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Authorization", "Content-Type"],
//   credentials: true,
// };
// app.use(cors(corsOptions));

// 2. Database Initialization
const populatedDatabase = require("../populatedb");
// import dbConnection from "./databaseSchemas/connectDatabase.js";
const dbConnection = require("../databaseSchemas/connectDatabase");
const { v4: uuidv4 } = require("uuid"); // ✅
try{
  console.log("Trying to connect to Database Aiven...");
  populatedDatabase();
}
catch(error){

  console.log("Error connecting to database", error);
}


// 3. View Engine & Static Assets
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../pmsclient", "build")));
app.use(express.static(path.join(__dirname, "public")));

// 4. Import Auth Middleware & Role Authorizer
const auth = require("../middlewares/authentification");
const authorize = require("../middlewares/authorize");

// 5. Import Routers
const oAuth2 = require("../oauthcallback");
const refreshTokens = require("../routes/tokensRouter");
const loginRouter = require("../routes/loginRouter");
const signupRouter = require("../routes/signupRouter");
const verifyemailRouter = require("../routes/verifyemailRouter");

// Role-Based Routers
const agencyRouter = require("../routes/propertymanagerRouter"); // Agency / Admin view
const landlordRouter = require("../routes/landlordRouter");
const caretakerRouter = require("../routes/caretakerRouter");
const tenantRouter = require("../routes/tenantRouter");
const maintenanceRouter = require("../routes/maintenanceRouter");

// 6. Public Authentication Routes
app.use("/o/auth/login", loginRouter);
app.use("/o/auth/verify", verifyemailRouter);
app.use("/o/auth/signup", signupRouter);
app.use("/o/auth/refreshtokens", refreshTokens);
app.use("/oauthcallback", oAuth2);

// 7. M-Pesa Payment Routes (Public for Safaricom Callback)
const { initiateStkPush, handleMpesaCallback } = require("../controllers/paymentController");
app.post("/api/payments/stk-push", auth, initiateStkPush);
app.post("/api/payments/callback", handleMpesaCallback);

  // 8. Bunny.net Image Upload Handler
  const upload = multer({ dest: "uploads/" });
  const BUNNY_STORAGE_URL = process.env.BUNNY_STORAGE_URL || "https://storage.bunnycdn.com/rentsureafricaimages-storage/";
  const BUNNY_ACCESS_KEY = process.env.BUNNY_ACCESS_KEY || "e82ef1ca-9a92-4cb2-bf148d33df4c-2d2c-4d0d";

  app.post("/upload", auth, upload.array("images", 20), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }



      const dbconn = dbConnection();
      const propertyId = req.body.propertyId;
      const category = req.body.category;

      if (!propertyId || !category) {
        return res.status(400).json({
          success: false,
          message: "propertyId and category are required"
        });
      }

      let uploadedImages = [];

      console.log("propertyId:", propertyId);
      console.log("category:", category);
      console.log("files:", req.files.length);


      for (const file of req.files) {
          try {
            const imageId = uuidv4();

            const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
            const bunnyPath = `${propertyId}/${category}/${fileName}`;

            console.log("Uploading to Bunny:", bunnyPath);

            const fileData = fs.readFileSync(file.path);

            await axios.put(`${BUNNY_STORAGE_URL}${bunnyPath}`, fileData, {
              headers: {
                AccessKey: BUNNY_ACCESS_KEY,
                "Content-Type": "application/octet-stream",
              },
            });

            console.log("Bunny upload successful");

            const imageUrl = `https://rentsureafrica-pullzone.b-cdn.net/${bunnyPath}`;

            await new Promise((resolve, reject) => {
              dbconn.query(
                `INSERT INTO apartmentimages SET ?`,
                {
                  image_id: imageId,
                  property_id: propertyId,
                  image_view: category,
                  image_status: "active",
                  image_path: imageUrl,
                },
                (err) => (err ? reject(err) : resolve())
              );
            });

            console.log("Database insert successful");

            uploadedImages.push(imageUrl);

            fs.unlinkSync(file.path);

          } catch (err) {
            console.error("UPLOAD LOOP ERROR:");
            console.error(err);
            throw err;
          }
    }

      res.json({ message: "Successfully uploaded photos", success: true, urls: uploadedImages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

































  // 9. Protected Multi-Role Routes
  app.use("/agency", auth, authorize(["agency"]), agencyRouter);
  app.use("/landlord", auth, authorize(["agency", "landlord"]), landlordRouter);
  app.use("/caretaker", auth, authorize(["agency", "landlord", "caretaker"]), caretakerRouter);
  app.use("/tenant", auth, authorize(["tenant"]), tenantRouter);
  app.use("/maintenance", auth, maintenanceRouter);
  // 2. Protected Multi-Role Routes Section
  app.use("/properties", auth, agencyRouter); 




// 10. Fallback Client Route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../pmsclient", "build", "index.html"));
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`PMS Server running on port ${port}`));







