exports.up = function (knex) {
    return knex.schema.table('users', table => {
        table.boolean('is_deleted').defaultTo(false)
    })
}

exports.down = function (knex) {
    return knex.schema.table('users', table => {
        table.boolean('is_deleted')
    })
}
