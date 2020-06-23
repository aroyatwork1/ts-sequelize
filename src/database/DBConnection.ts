const sequelize = require('sequelize');

export class DBConnection {
    private static _dbConn: any;

    constructor() {

    }

    async connect() {
        return new Promise((resolve, reject) => {
            if (DBConnection._dbConn) {
                resolve(DBConnection._dbConn);
            }

            const connectionConfig = {
                "host": "localhost",
                "dialect": "mssql",
                "logging": false,
                "dialectOptions": {
                    instanceName: "NOICLT37171\SQLEXPRESS",
                    "options":{
                        "encrypt": true
                    }
                },
                "pool": {
                    "max": 5,
                    "min": 1,
                    "acquire": 30000,
                    "idle": 10000
                },
                "port": 50945,
                 "retry": {
                     "max": 2
                 }
            }

            try {
                DBConnection._dbConn = new sequelize("calendar", "sa", "Pass@123", connectionConfig);
                DBConnection._dbConn.authenticate().then(() => {
                    resolve(DBConnection._dbConn);
                });
            } catch (e) {
                console.error("Cannot connect to db");
                reject(e);
            }
        });
    }
}