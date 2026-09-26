import mysql from "mysql2";
import dbConnection from "../databaseSchemas/connectDatabase";
// var uniqueId = require("../databaseSchemas/uniqueId")
import { v4 as uuidv4 } from 'uuid';
import { verify } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { check } from "express-validator";


export async function createProperty(req, res, next) {
    console.log("here is the req.body below");
    console.log(req.body);

    const dbconn = dbConnection();
    const uniqueId = uuidv4();

    // Get logged-in user from JWT
    async function getHeaders() {
        try {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];

                const decodedToken = verify(
                    token,
                    process.env.ACCESS_TOKEN_SECRET
                );

                console.log("Decoded Token:");
                console.log(decodedToken);

                return decodedToken;
            }

            return null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Decode user once
    const decodedToken = await getHeaders();

    // Property data
    const propertyData = {
        property_id: uniqueId,
        user_id: decodedToken?.user_id || null,
        property_name: req.body.propertyname,
        total_units: req.body.totalunits,
        available_units: req.body.availableunits,
    };

    dbconn.query(
        `INSERT INTO properties SET ?`,
        propertyData,
        (err, results, fields) => {
            if (err) {
                console.log(err);

                if (err.code === "ER_DUP_ENTRY") {
                    console.log("Duplicate UUID. Generating another...");

                    const propertyId = uuidv4();

                    const propertyData = {
                        property_id: propertyId,
                        user_id: decodedToken?.user_id || null,
                        property_name: req.body.propertyname,
                        total_units: req.body.totalunits,
                        available_units: req.body.availableunits,
                    };

                    dbconn.query(
                        `INSERT INTO properties SET ?`,
                        propertyData,
                        (err, results, fields) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send({
                                    message: "Failed to create property",
                                });
                            }

                            console.log(results);
                            console.log("New Property Created on second UUID trial");

                            return res.status(201).send({
                                message:
                                    "New Property Created, from after ERR_Dup_Entry",
                                propertyid: propertyData.property_id,
                            });
                        }
                    );
                } else {
                    return res.status(500).send({
                        message: "Database error creating property",
                    });
                }
            } else {
                console.log(results);
                console.log("New Property Created on First Trial");

                return res.status(201).send({
                    message:
                        "New Property Created, from after First Generation of UUID",
                    propertyid: propertyData.property_id,
                });
            }
        }
    );
}




export function createLandlord(req,res,next){
    console.log(req.body);
    console.log(req.body.landlordphonenumber);

    const property_id=req.params.propertyid;
    console.log("Here is the property Id " + property_id)

    const dbconn=dbConnection()
    const uniqueId=uuidv4()

    const userData={user_id:uniqueId, first_name:req.body.landlordname, email:req.body.landlordemail, role:JSON.stringify({roles:["LANDLORD"]}), status:"pending", phonenumber:req.body.landlordphonenumber}
        
    const checkuser =`SELECT * FROM users WHERE email='${req.body.landlordemail}';`;

    const checkProperty=`SELECT * FROM properties WHERE property_id='${property_id}';`;

    // const checkLandlordPerProperty = `SELECT * FROM properties WHERE landlord_id IS NOT NULL AND landlord_id != '';`;

    const checkLandlordPerProperty = `SELECT * FROM properties WHERE property_id='${property_id}' AND landlord_id IS NOT NULL AND landlord_id != '';`;
    

    console.log(req.body.landlordphonenumber);

    dbconn.query(checkuser, function(err, results){
        if(err){
            console.log(err);
        }
        else{
            console.log(results[0]);
            if(results.length <1){
                dbconn.query(`INSERT INTO users SET ?`, userData, (err,results, fields)=>{
                    const uniqueID=uuidv4();

                    const landlord_id=uuidv4();

                    const userData2={user_id:uniqueID, first_name:req.body.landlordname, email:req.body.landlordemail, role:JSON.stringify({roles:["LANDLORD"]}), status:"pending", phonenumber:req.body.landlordphonenumber}
                    const landlordData={landlord_id:landlord_id, user_id:userData2.user_id,  first_name:userData2.landlordname, email:userData2.email, phonenumber:userData2.phonenumber} 
                    const propertyData={landlord_id:landlord_id,user_id:uniqueID};

                    if(err){

                        if(err.code=='ER_DUP_ENTRY'){

                            dbconn.query(`INSERT INTO users SET ?`, userData2, (err,results, fields)=>{
                                if(err){
                                    console.log(err)
                                    
                                }
                                else{


                                    // dbconn.query(checkLandlordPerProperty, (err,checklandlordperpropertyresults)=>{                                        
                                    dbconn.query(checkLandlordPerProperty,[property_id],(err, checklandlordperpropertyresults) => {
                                        if(err){
                                            console.log(err)
                                        }
                                        else{
                                            if(checklandlordperpropertyresults.length<1){
                                                
                                                dbconn.query(`INSERT INTO landlords SET ? `, landlordData, (err,results)=>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                    else{
                                                        console.log("New Landlord Successfully created Results below ")
                                                        console.log(results);
                                                
                                                        dbconn.query(checkProperty, (err,results)=>{
                                                            if(err){
                                                                console.log(err)
                                                            }
                                                            else{
                                                                if(results.length>0){
                                                                    dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                                                        if(err){
                                                                            console.log("error inserting into properties table");
                                                                            console.log(err)
                                                                        }
                                                                        else{
                                                                            console.log("properties table sucessfully updated");
                                                                            console.log(results)            
                                                                        }
                                                                    })
                                                                }
                                                                else{
                                                                    console.log("No such propeperty Registered yet!")
                    
                                                                }
                    
                                                            }
                                                        })
            
                                                        return res.status(201).send({message:`New Landlord Created Successfully, Check Email to Verify Account`})
            
            
                                                      
                                                    }
                                                })
                                            }
                                            else{
                                                // if (checklandlordperpropertyresults.length > 0) {
                                                //     return res.status(409).send({
                                                //         message: "This property already has a landlord assigned."
                                                //     });
                                                // }

                                                if (checklandlordperpropertyresults.length > 0) {
                                                    const existingLandlordId = checklandlordperpropertyresults[0].landlord_id;

                                                    const landlordUpdate = {
                                                        first_name: req.body.landlordname,
                                                        email: req.body.landlordemail,
                                                        phonenumber: req.body.landlordphonenumber
                                                    };

                                                    dbconn.query(
                                                        `UPDATE landlords SET ? WHERE landlord_id = ?`,
                                                        [landlordUpdate, existingLandlordId],
                                                        (err) => {
                                                            if (err) {
                                                                console.log(err);
                                                                return res.status(500).send({
                                                                    message: "Failed to update landlord"
                                                                });
                                                            }

                                                            // continue wizard successfully
                                                            return res.status(200).send({
                                                                message: "Landlord updated successfully",
                                                                landlordid: existingLandlordId
                                                            });
                                                        }
                                                    );

                                                    return;
                                                }

                                                // No landlord on this property yet → create one
                                                dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send({
                                                            message: "Failed to create landlord"
                                                        });
                                                    }

                                                    dbconn.query(
                                                        `UPDATE properties SET ? WHERE property_id = ?`,
                                                        [propertyData, property_id],
                                                        (err) => {
                                                            if (err) {
                                                                console.log(err);
                                                                return res.status(500).send({
                                                                    message: "Failed to link landlord to property"
                                                                });
                                                            }

                                                            return res.status(201).send({
                                                                message: "New Landlord Created Successfully"
                                                            });
                                                        }
                                                    );
                                                });







                                                dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log("New Landlord Successfully created Results below");
                                                        console.log(results);

                                                        dbconn.query(checkProperty, (err, results) => {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                if (results.length > 0) {
                                                                    dbconn.query(
                                                                        `UPDATE properties SET ? WHERE property_id='${property_id}';`,
                                                                        propertyData,
                                                                        (err, results) => {
                                                                            if (err) {
                                                                                console.log("error inserting into properties table");
                                                                                console.log(err);
                                                                            } else {
                                                                                console.log("properties table successfully updated");
                                                                                console.log(results);
                                                                            }
                                                                        }
                                                                    );
                                                                } else {
                                                                    console.log("No such property registered yet!");
                                                                }
                                                            }
                                                        });

                                                        return res.status(201).send({
                                                            message: "New Landlord Created Successfully, Check Email to Verify Account"
                                                        });
                                                    }
                                                });
                                            }

                                        }
                                    })
                                    
                               

                
            
                                }
                            })
                        }
                        else{
                            console.log(err)

                        }
                    }
                    else{

                        // var landlord_id=uuidv4();
                        const landlordData2={landlord_id:landlord_id, user_id:userData.user_id,  first_name:userData.first_name, email:userData.email, phonenumber:userData.phonenumber} 
                        // const uniqueID=uuidv4();
                        const propertyData2={landlord_id:landlord_id,user_id:uniqueId};





                        // dbconn.query(checkLandlordPerProperty, (err,checklandlordperpropertyresults)=>{
                        dbconn.query(checkLandlordPerProperty,[property_id],(err, checklandlordperpropertyresults) => {

                            if(err){
                                console.log(err)
                            }
                            else{
                                if(checklandlordperpropertyresults.length<1){
                                    dbconn.query(`INSERT INTO landlords SET ? `, landlordData2, (err,results)=>{
                                        if(err){
                                            console.log(err)
                                        }
                                        else{
                                            console.log("New Landlord Successfully created Results below ")
                                            console.log(results);
                                            
                                            dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData2, (err,results)=>{
                                                if(err){
                                                    console.log("error inserting into properties table");
                                                    console.log(err)
                                                }
                                                else{
                                                    console.log("properties table sucessfully updated");
                                                    console.log(results)            
                                                }
                                            })
            
                                            return res.status(201).send({message:`New Landlord Created Successfully, Check Email to Verify Account`})
                               
                                        }
                                    }) 
                                }
                                else{

                                    // if (checklandlordperpropertyresults.length > 0) {
                                    //     return res.status(409).send({
                                    //         message: "This property already has a landlord assigned."
                                    //     });
                                    // }
                                    if (checklandlordperpropertyresults.length > 0) {
                                        const existingLandlordId = checklandlordperpropertyresults[0].landlord_id;

                                        const landlordUpdate = {
                                            first_name: req.body.landlordname,
                                            email: req.body.landlordemail,
                                            phonenumber: req.body.landlordphonenumber
                                        };

                                        dbconn.query(
                                            `UPDATE landlords SET ? WHERE landlord_id = ?`,
                                            [landlordUpdate, existingLandlordId],
                                            (err) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).send({
                                                        message: "Failed to update landlord"
                                                    });
                                                }

                                                // continue wizard successfully
                                                return res.status(200).send({
                                                    message: "Landlord updated successfully",
                                                    landlordid: existingLandlordId
                                                });
                                            }
                                        );

                                        return;
                                    }

                                    // No landlord on this property yet → create one
                                    dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send({
                                                message: "Failed to create landlord"
                                            });
                                        }

                                        dbconn.query(
                                            `UPDATE properties SET ? WHERE property_id = ?`,
                                            [propertyData, property_id],
                                            (err) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).send({
                                                        message: "Failed to link landlord to property"
                                                    });
                                                }

                                                return res.status(201).send({
                                                    message: "New Landlord Created Successfully"
                                                });
                                            }
                                        );
                                    });                                    

                                    dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("New Landlord Successfully created Results below");
                                            console.log(results);

                                            dbconn.query(checkProperty, (err, results) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    if (results.length > 0) {
                                                        dbconn.query(
                                                            `UPDATE properties SET ? WHERE property_id='${property_id}';`,
                                                            propertyData,
                                                            (err, results) => {
                                                                if (err) {
                                                                    console.log("error inserting into properties table");
                                                                    console.log(err);
                                                                } else {
                                                                    console.log("properties table successfully updated");
                                                                    console.log(results);
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        console.log("No such property registered yet!");
                                                    }
                                                }
                                            });

                                            return res.status(201).send({
                                                message: "New Landlord Created Successfully, Check Email to Verify Account"
                                            });
                                        }
                                    });
                                }

                            }
                        })                   

                    }
                })
            }
            else{
             
                console.log("Here is the existing lanlodrd \n")

                console.log(results[0])


                console.log("Here is the existing landlord \n");

                console.log(results[0]);

                    let role = results[0].role;

                    // Check if roleData is a string before parsing
                    if (typeof role === "string") {
                        role = JSON.parse(role); // Parse only if it's a string
                    }

                    console.log("Here is the role object:", role);
                    console.log(role);


                // var role=JSON.parse(results[0].role);
                console.log("here is the role object" + role);
                console.log(role );

                const containsrole=role.roles.includes("LANDLORD");
                var current_roles=role.roles;


                console.log("just set the update user " + current_roles)
                console.log("here is the !containsroles " + containsrole)
            
                
                var landlord_id=uuidv4();
                var landlordData={landlord_id:landlord_id, user_id:results[0].user_id, first_name:userData.first_name, email:userData.email, phonenumber:userData.phonenumber} 
                var propertyData={landlord_id:landlord_id,user_id:results[0].user_id};

                if(!containsrole){
                    var update_roles= current_roles.push("LANDLORD");
                    console.log("updated roles list   "   + update_roles)
                    console.log(update_roles);
                    console.log(current_roles);

                    const update_user={role:JSON.stringify({roles:current_roles})}
                    console.log("updated roles list   "   + update_user);
                    console.log(update_user)


                        
                    dbconn.query(`UPDATE users SET ? WHERE user_id='${results[0].user_id}';`, update_user, (err,result)=>{
                        if(err){
                            console.log("error updating the user's roles into users table");
                            console.log(err)
                        }
                        else{
                            console.log("User's role successfully updating the user's roles into users table");
                            console.log(result)
                            console.log(result);

                            console.log("here are the user details from already exists user landlord");
                            console.log(results);
                            console.log(results);
            
                            // console.log(userDaa.phonenumber)
            

                            // dbconn.query(checkLandlordPerProperty, (err,checklandlordperpropertyresults)=>{
                            dbconn.query(checkLandlordPerProperty,[property_id],(err, checklandlordperpropertyresults) => {

                                if(err){
                                    console.log(err)
                                }
                                else{
                                    if(checklandlordperpropertyresults.length<1){
                                        dbconn.query(`INSERT INTO landlords SET ? `, landlordData, (err,results)=>{
                                            if(err){
                                                console.log(err)
                                            }
                                            else{
                                                console.log("New Landlord Successfully created Results below ")
                                                console.log(results);
                                                
                        
                                                dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                                    if(err){
                                                        console.log("error inserting into properties table");
                                                        console.log(err)
                                                    }
                                                    else{
                                                        console.log("properties table sucessfully updated");
                                                        console.log(results)            
                                                    }
                                                })
                        
                                                return res.status(201).send({message:`New Landlord Created Successfully, Check Email to Verify Account`})
                        
                        
                                            }
                                        })     
                                        
                                    }
                                    else{
                                            
                                        // if (checklandlordperpropertyresults.length > 0) {
                                        //     return res.status(409).send({
                                        //         message: "This property already has a landlord assigned."
                                        //     });
                                        // }
                                        if (checklandlordperpropertyresults.length > 0) {
                                            const existingLandlordId = checklandlordperpropertyresults[0].landlord_id;

                                            const landlordUpdate = {
                                                first_name: req.body.landlordname,
                                                email: req.body.landlordemail,
                                                phonenumber: req.body.landlordphonenumber
                                            };

                                            dbconn.query(
                                                `UPDATE landlords SET ? WHERE landlord_id = ?`,
                                                [landlordUpdate, existingLandlordId],
                                                (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send({
                                                            message: "Failed to update landlord"
                                                        });
                                                    }

                                                    // continue wizard successfully
                                                    return res.status(200).send({
                                                        message: "Landlord updated successfully",
                                                        landlordid: existingLandlordId
                                                    });
                                                }
                                            );

                                            return;
                                        }

                                        // No landlord on this property yet → create one
                                        dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send({
                                                    message: "Failed to create landlord"
                                                });
                                            }

                                            dbconn.query(
                                                `UPDATE properties SET ? WHERE property_id = ?`,
                                                [propertyData, property_id],
                                                (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send({
                                                            message: "Failed to link landlord to property"
                                                        });
                                                    }

                                                    return res.status(201).send({
                                                        message: "New Landlord Created Successfully"
                                                    });
                                                }
                                            );
                                        });                                            

                                        dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("New Landlord Successfully created Results below");
                                                console.log(results);

                                                dbconn.query(checkProperty, (err, results) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        if (results.length > 0) {
                                                            dbconn.query(
                                                                `UPDATE properties SET ? WHERE property_id='${property_id}';`,
                                                                propertyData,
                                                                (err, results) => {
                                                                    if (err) {
                                                                        console.log("error inserting into properties table");
                                                                        console.log(err);
                                                                    } else {
                                                                        console.log("properties table successfully updated");
                                                                        console.log(results);
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            console.log("No such property registered yet!");
                                                        }
                                                    }
                                                });

                                                return res.status(201).send({
                                                    message: "New Landlord Created Successfully, Check Email to Verify Account"
                                                });
                                            }
                                        });

                                    }
                                }
                            })

                        }
                    })

                }
                else{
                    // dbconn.query(checkLandlordPerProperty, (err,checklandlordperpropertyresults)=>{
                    dbconn.query(checkLandlordPerProperty,[property_id],(err, checklandlordperpropertyresults) => {
                        if(err){
                            console.log(err)
                        }
                        else{
                            if(checklandlordperpropertyresults.length<1){
                                dbconn.query(`INSERT INTO landlords SET ? `, landlordData, (err,results)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        console.log("New Landlord Successfully created Results below ")
                                        console.log(results);
                                        
                
                                        dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                            if(err){
                                                console.log("error inserting into properties table");
                                                console.log(err)
                                            }
                                            else{
                                                console.log("properties table sucessfully updated");
                                                console.log(results)            
                                            }
                                        })
                
                                        return res.status(201).send({message:`New Landlord Created Successfully, Check Email to Verify Account`})
                
                
                                    }
                                })     
                                
                            }
                            else{
                        
                                                                    
                                // if (checklandlordperpropertyresults.length > 0) {
                                //     return res.status(409).send({
                                //         message: "This property already has a landlord assigned."
                                //     });
                                // }
                                if (checklandlordperpropertyresults.length > 0) {
                                    const existingLandlordId = checklandlordperpropertyresults[0].landlord_id;

                                    const landlordUpdate = {
                                        first_name: req.body.landlordname,
                                        email: req.body.landlordemail,
                                        phonenumber: req.body.landlordphonenumber
                                    };

                                    dbconn.query(
                                        `UPDATE landlords SET ? WHERE landlord_id = ?`,
                                        [landlordUpdate, existingLandlordId],
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send({
                                                    message: "Failed to update landlord"
                                                });
                                            }

                                            // continue wizard successfully
                                            return res.status(200).send({
                                                message: "Landlord updated successfully",
                                                landlordid: existingLandlordId
                                            });
                                        }
                                    );

                                    return;
                                }

                                // No landlord on this property yet → create one
                                dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send({
                                            message: "Failed to create landlord"
                                        });
                                    }

                                    dbconn.query(
                                        `UPDATE properties SET ? WHERE property_id = ?`,
                                        [propertyData, property_id],
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send({
                                                    message: "Failed to link landlord to property"
                                                });
                                            }

                                            return res.status(201).send({
                                                message: "New Landlord Created Successfully"
                                            });
                                        }
                                    );
                                });                                         

                                dbconn.query(`INSERT INTO landlords SET ?`, landlordData, (err, results) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("New Landlord Successfully created Results below");
                                        console.log(results);

                                        dbconn.query(checkProperty, (err, results) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                if (results.length > 0) {
                                                    dbconn.query(
                                                        `UPDATE properties SET ? WHERE property_id='${property_id}';`,
                                                        propertyData,
                                                        (err, results) => {
                                                            if (err) {
                                                                console.log("error inserting into properties table");
                                                                console.log(err);
                                                            } else {
                                                                console.log("properties table successfully updated");
                                                                console.log(results);
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    console.log("No such property registered yet!");
                                                }
                                            }
                                        });

                                        return res.status(201).send({
                                            message: "New Landlord Created Successfully, Check Email to Verify Account"
                                        });
                                    }
                                });

                            }
                        }
                    })
                }  

            }
        }
    })    


}


export async function createCaretaker(req,res,next){
    const caretakerdetails=req.body;
    const property_id=req.params.propertyid;
    const dbconn=dbConnection()
    const uniqueId=uuidv4()
    const userData={user_id:uniqueId, first_name:req.body.caretakername, email:req.body.caretakeremail, role:JSON.stringify({roles:["CARETAKER"]}), status:"pending", phonenumber:req.body.caretakerphonenumber}
    const checkuser =`SELECT * FROM users WHERE email='${req.body.caretakerdemail}';`;
    const checkProperty=`SELECT * FROM properties WHERE property_id='${property_id}';`;
    
    console.log(caretakerdetails);
    console.log("Here is the property Id for createCaretaker" + property_id);


    const  caretaker_id=uuidv4();
    
    const caretakerData={caretaker_id:caretaker_id, user_id:uniqueId, first_name:req.body.caretakername, email:req.body.caretakeremail, phonenumber:req.body.caretakerphonenumber}
    const propertyData={caretaker_id:caretaker_id};
    


    try{ 
        dbconn.query(checkuser, function(err, results){
            if(err){
                console.log(err);
                throw err;
            }
            else{
                if(results.length <1){
                    dbconn.query(`INSERT INTO users SET ?`, userData, (err,results, fields)=>{
                        if(err){
                            console.log(err);
                            throw err;
                        }
                        else{
                        
                            dbconn.query(`INSERT INTO caretakers SET ? `, caretakerData, (err,results)=>{
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    console.log("New Caretaker Successfully created Results below ")
                                    console.log(results);
                            
                                    dbconn.query(checkProperty, (err,results)=>{
                                        if(err){
                                            console.log(err)
                                        }
                                        else{
                                            if(results.length>0){
                                                dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                                    if(err){
                                                        console.log("error inserting into properties table");
                                                        console.log(err)
                                                    }
                                                    else{
                                                        console.log("properties table sucessfully updated");
                                                        console.log(results)            
                                                    }
                                                })
                                            }
                                            else{
                                                console.log("No such propeperty Registered yet!")

                                            }

                                        }
                                    })

                                    return res.status(201).send({message:`New Caretaker Created Successfully, Caretaker to Check Email to Verify Account`})         
                                }
                            })
                        }
                    })
                }
                else{

                    var role=JSON.parse(results[0].role);
                    console.log("here isthe role object" + role);
                    console.log(role );
    
                    const containsrole=role.roles.includes("CARETAKER");
                    var current_roles=role.roles;
    
    
                    console.log("just set the update user " + current_roles)
                    console.log("here is the !containsroles " + containsrole)
                

                    const user_id=results[0];              
                    const caretakerData2={caretaker_id:caretaker_id, user_id:user_id, first_name:req.body.caretakername, email:req.body.caretakeremail, phonenumber:req.body.caretakerphonenumber}
                   


                    if(!containsrole){
                        var update_roles= current_roles.push("CARETAKER");
                        console.log("updated roles list   "   + update_roles)
                        console.log(update_roles);
                        console.log(current_roles);
    
                        const update_user={role:JSON.stringify({roles:current_roles})}
                        console.log("updated roles list   "   + update_user);
                        console.log(update_user)
    
    
                            
                        dbconn.query(`UPDATE users SET ? WHERE user_id='${results[0].user_id}';`, update_user, (err,result)=>{
                            if(err){
                                console.log("error updating the user's roles into users table");
                                console.log(err)
                            }
                            else{
                                console.log("User's role successfully updating the user's roles into users table");
                                console.log(result)
                                console.log(result);
    
                                console.log("here are the user details from already exists user caretaker");
                                console.log(results);
                                console.log(results);
        
                                dbconn.query(`INSERT INTO caretakers SET ? `, caretakerData2, (err,results)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        console.log("New Caretaker Successfully created Results below ")
                                        console.log(results);
                                
                                        dbconn.query(checkProperty, (err,results)=>{
                                            if(err){
                                                console.log(err)
                                            }
                                            else{
                                                if(results.length>0){
                                                    dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                                        if(err){
                                                            console.log("error inserting into properties table");
                                                            console.log(err)
                                                        }
                                                        else{
                                                            console.log("properties table sucessfully updated with new caretaker");
                                                            console.log(results)            
                                                        }
                                                    })
                                                }
                                                else{
                                                    console.log("No such propeperty Registered yet!")
            
                                                }
            
                                            }
                                        })
            
                                        return res.status(201).send({message:`New Caretaker Created Successfully, Caretaker to Check Email to Verify Account`})         
                                    }
                                })
        
        
                            }
                        })

                    }
                    else{
    
                        dbconn.query(`INSERT INTO caretakers SET ? `, caretakerData2, (err,results)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log("New Caretaker Successfully created Results below ")
                                console.log(results);
                        
                                dbconn.query(checkProperty, (err,results)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        if(results.length>0){
                                            dbconn.query(`UPDATE properties SET ? WHERE property_id='${property_id}';`, propertyData, (err,results)=>{
                                                if(err){
                                                    console.log("error inserting into properties table");
                                                    console.log(err)
                                                }
                                                else{
                                                    console.log("properties table sucessfully updated with new caretaker");
                                                    console.log(results)            
                                                }
                                            })
                                        }
                                        else{
                                            console.log("No such propeperty Registered yet!")
    
                                        }
    
                                    }
                                })
    
                                return res.status(201).send({message:`New Caretaker Created Successfully, Caretaker to Check Email to Verify Account`})         
                            }
                        })


                    }

                }
            }
        })
    }
    catch(err){
        console.log(err);
    }
}


export async function listpropertyfeatures(req,res,next){
    
    console.log("About to start Listing the Properties Features");

    console.log("Here below are the property Features");

    console.log(req.body);
    console.log(req.params);
  
    // res.status(201).send({message:"Finally GOT TO BACKEND WITH THE MESSAGE TO POST, NOW HERE IS THE ANSWER FROM BEHIND THE BACKEND"});

    
    const propertyId=req.params.propertyid;
    
    var dbconn=dbConnection()


    const internalfeatures=JSON.stringify(req.body.propertyinternalfeatures);

    const externalfeatures=JSON.stringify(req.body.propertyexternalfeatures);


    const nearbyfeatures=JSON.stringify(req.body.propertynearbyfeatures );


    const roomsperunit=JSON.stringify(req.body.propertyroomsperunit );


    const pricesperunit=JSON.stringify( req.body.propertypriceperunit  );

    const propertylocation = req.body.propertylocation;


    var propertydetails={property_type:req.body.propertytype, listing_purpose:req.body.propertylistingpurpose,internal_features_per_unit:internalfeatures,
        apartment_external_features:externalfeatures,apartment_features_nearby:nearbyfeatures,apartment_rooms_per_unit:roomsperunit,prices_per_unit:pricesperunit,
        property_latitude: propertylocation?.latitude,property_longitude: propertylocation?.longitude,property_address: propertylocation?.formattedAddress,
        property_place_id: propertylocation?.placeId
    }



    dbconn.query(`UPDATE properties SET ? WHERE property_id='${propertyId}'`, propertydetails, (err,results)=>{
        if(err){
            console.log("Error inserting Property Features to Table properties  ", err)
        }
        else{
            console.log(results)
            console.log("Successfully Inserted property features to properties TABLE CONGRATS")

            res.status(201).send({message:"Successfully Inserted property features to properties TABLE CONGRATS"});

        }
    })



}

const getDecodedUser = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    return null;
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return null;
  }
};

/**
 * Fetch all properties managed by the agency / user
 * Route: GET /
 */
export function all_properties(req, res, next) {
  const dbconn = dbConnection();
  const decodedToken = getDecodedUser(req);
  
  let query = "SELECT * FROM properties";
  let queryParams = [];

  // Filter properties by user_id if token is present
  if (decodedToken && decodedToken.user_id) {
    query += " WHERE user_id = ?";
    queryParams.push(decodedToken.user_id);
  }

  dbconn.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching properties:", err);
      return res.status(500).json({ success: false, message: "Database query error while fetching properties." });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  });
}

/**
 * Fetch specific property details
 * Route: GET /apartment?propertyid=XYZ
 */
export function property_details(req, res, next) {
  const dbconn = dbConnection();
  const propertyId = req.query.propertyid || req.query.id || req.params.propertyid;

  if (!propertyId) {
    return res.status(400).json({ success: false, message: "Property ID is required." });
  }

  const query = "SELECT * FROM properties WHERE property_id = ? LIMIT 1";

  dbconn.query(query, [propertyId], (err, results) => {
    if (err) {
      console.error("Error fetching property details:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch property details." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    return res.status(200).json({
      success: true,
      data: results[0]
    });
  });
}






export function getPropertyImages(req, res) {
    const dbconn = dbConnection();
    const propertyId = req.params.propertyid;

    dbconn.query(
        `SELECT * FROM apartmentimages
         WHERE property_id = ?
         AND image_status = 'active'`,
        [propertyId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ success:false });
            }

            const images = {
                outside: [],
                inside: [],
                other: [],
                camera: []
            };

            results.forEach((img) => {
                if (images[img.image_view]) {
                    images[img.image_view].push({
                        imageId: img.image_id,
                        url: img.image_path
                    });
                }
            });

            res.json({
                success: true,
                data: images
            });
        }
    );
}








export async function deletePropertyImage(req, res) {
    const imageId = req.params.imageid;
    const dbconn = dbConnection();

    try {
        // 1. Find the image in MySQL
        dbconn.query(
            `SELECT * FROM apartmentimages WHERE image_id = ? LIMIT 1`,
            [imageId],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Image not found"
                    });
                }

                const image = results[0];

                // 2. Convert Pull Zone URL into Bunny Storage path
                const filePath = image.image_path.replace(
                    "https://rentsureafrica-pullzone.b-cdn.net/",
                    ""
                );

                // 3. Delete from Bunny Storage
                await axios.delete(`${BUNNY_STORAGE_URL}${filePath}`, {
                    headers: {
                        AccessKey: BUNNY_ACCESS_KEY,
                    },
                });

                // 4. Delete metadata from MySQL
                dbconn.query(
                    `DELETE FROM apartmentimages WHERE image_id = ?`,
                    [imageId],
                    (deleteErr) => {
                        if (deleteErr) {
                            return res.status(500).json({
                                success: false,
                                message: deleteErr.message,
                            });
                        }

                        return res.json({
                            success: true,
                            message: "Image deleted successfully",
                        });
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
