var dbCon = require('../dao/mongoconnector.js');
var objConfig = require('../config.js');
var format = require('util').format;
/**
 * Assign the logger value with console reference to avoid the
 * conflicts of the context value when deployed on Azure
 */
var logger = console;

/**
 * @description - Code to retrieve the server status and update the
 * DELTA_DBStatistics table for collecting the database
 * statistics information
 * @param {Azure local context val or console object reference} context
 * @param {Respose to be returned} callback
 * @return - callback
 */
function insertDatabaseStatistics(context, callback) {
    // To override the object with the one passed, this
    // is to handle the context object passed by Azure
    logger = context;
    logger.log("Database Statistics invoked", new Date());
    dbCon.getDb(function (err, Objdb) {
        if (err) {
            callback(err, null);
        } else {
            // Get the admin object reference to retrieve the server status information
            var adminDb = Objdb.db.admin();
            // Authenticate using admin user

            //remote
            //objConfig.inputdatasource.admin
            //objConfig.inputdatasource.adminpassword
            
            //local
            //objConfig.inputdatasource.username, objConfig.inputdatasource.password

            adminDb.authenticate(objConfig.inputdatasource.admin, objConfig.inputdatasource.adminpassword, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    // API call to retrive the server status Info
                    adminDb.serverStatus(function (err, info) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var document = info;
                            var objCollection = Objdb.DELTA_DBStatistics;
                            transportSecurity = [];
                            //mongo doesn't take key with $ 
                            document["$clusterTime"] = (document["$clusterTime"]) ? document["$clusterTime"] : 0;
                            document["clusterTime"] = document["$clusterTime"];
                            delete document["$clusterTime"];
                            for (i in document.transportSecurity) {
                                if (document.transportSecurity.hasOwnProperty(i)) {
                                    let key = i.replace(".", "_");
                                    let security = {};
                                    security[key] = document.transportSecurity[i];
                                    transportSecurity.push(security)
                                }
                            }
                            document["transportSecurity"] = document["$transportSecurity"];
                            document["transportSecurity"] = transportSecurity;
                            delete document["$transportSecurity"];
                            // Insert the retrieved server status information to the mongo collection
                            objCollection.insert(document, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, true);
                                }
                                dbCon.closeDB();
                            });
                        }
                    });
                }
            });
        }
    });
}



module.exports = {
    insertDatabaseStatistics: insertDatabaseStatistics
};
