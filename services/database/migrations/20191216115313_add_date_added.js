exports.up = function (knex) {
    return knex.schema.table('users', table => {
        table.integer('datetime_added').defaultTo(null)
    })
};

exports.down = function (knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('datetime_added')
    })
};
