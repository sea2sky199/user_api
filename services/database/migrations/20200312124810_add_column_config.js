exports.up = function (knex) {
    return knex.schema.table('users', table => {
        table.specificType('column_config', 'TEXT')
        table.specificType('similarity_column_config', 'TEXT')
    })
};

exports.down = function (knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('column_config')
        table.dropColumn('similarity_column_config')
    })
};
