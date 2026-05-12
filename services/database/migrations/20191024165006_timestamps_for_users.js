exports.up = function(knex) {
    return knex.schema.table('users', table => {
        table.integer('last_access_time')
        table.integer('last_chemdw_time')
    })
}

exports.down = function(knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('last_access_time')
        table.dropColumn('last_chemdw_time')
    })
}
