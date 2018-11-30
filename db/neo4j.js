const neo4j = require('neo4j-driver').v1;
var driver;
if(process.env.NODE_ENV == "testCloud" || process.env.NODE_ENV == "production"){
  driver = neo4j.driver('bolt://hobby-ndphmkniipmbgbkeajhfffbl.dbs.graphenedb.com:24786', neo4j.auth.basic('student', 'b.5m8jtUCXvQtc.3l8IOIor9grsSYyo'));
} else {
  driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Test123$'));
}


module.exports = {driver};
