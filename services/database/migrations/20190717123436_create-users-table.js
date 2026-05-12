exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id')
    table.integer('user_id').notNullable()
    table.string('name', 256).notNullable()
    table.string('email', 512).notNullable()
    table.string('role', 128).notNullable()
  }).catch((err) => {
    if(err.message.indexOf('already exists') > 0) {
      console.log("User Table already exists")
    } else {
      throw (err)
    }
  })
};

exports.down = function(knex) {
};
