const express = require('express')
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const debug = require('debug')('CHEM:APP')
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const { UsersRouter: users } = require('./routes')


const app = express()
const port = process.env.PORT || 8001
app.use(bodyParser.json())

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CHEM App API',
            version: '0.1.0'
        },
        basePath: '/'
    },
    apis: ['./docs/*.js']
})

// serve up swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Check authentication if CHEM_AUTH_TOKEN environment variable exists

if (process.env.CHEM_AUTH_TOKEN) {
    app.use(
        basicAuth({
            users: { gateway: process.env.CHEM_AUTH_TOKEN }
        })
    )
}

// serve up routes
app.use('/', users)

if (require.main === module) {
    debug(`Starting on port ${port}`)
    app.listen(port, () => console.log(`CHEM app api listening on port ${port}!`))
    debug(`After listening on port ${port}`)
}

module.exports = app