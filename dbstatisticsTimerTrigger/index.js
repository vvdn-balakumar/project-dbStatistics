var objDBStatistics = require('./controllers/dbStatistics.js');
var dbCon = require('./dao/mongodaoimpl');

module.exports = function (context, myTimer) {
    context.log('DBStatistics map initiated');
    objDBStatistics.insertDatabaseStatistics(context, function (err, obj) {
        context.log('Error insertDatabaseStatistics', err);
        dbCon.closeConnection();
        context.done();
    });
};