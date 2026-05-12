const path = require('path')
const debug = require("debug")("CHEM:APP_DATA_SVC Config");
//const cfenv = require('cfenv')
//const debug = require('debug')('CHEM:APP_DATA_SVC')


//check PCF for DB credentials, otherwise get from ENV 
//const appEnv = cfenv.getAppEnv()
//const dbServiceData = appEnv.getService('chem-app-db')
//let dbServiceCredentials

//try {
//    dbServiceCredentials = dbServiceData.credentials
//} catch (error) {
//    if (error instanceof TypeError) {
//        dbServiceCredentials = process.env.CHEM_APP_DB_URL
//        debug("dbServiceCredentials", dbServiceCredentials)
//    }
//}

const dbServiceCredentials = process.env.CHEM_APP_DB_URL

baseConfig = {
    client: 'mysql2',
    //connection: dbServiceCredentials,
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'test',
      password: 'test',
      database: 'chem'
    },   
    acquireConnectionTimeout: 2000,
    pool: {
        min: 1,
        max: 10,
        afterCreate: (conn, done) => {
            debug('Connection pool established')
            done()
        }
    },
    migrations: {
        directory: path.join(process.cwd(), 'services', 'database', 'migrations')
    }
}

module.exports = {
    development: {
        ...baseConfig,
        seeds: { directory: path.join(process.cwd(), 'services', 'database', 'seeds') }
    },
    bdd: { ...baseConfig },
    production: { ...baseConfig }
}
