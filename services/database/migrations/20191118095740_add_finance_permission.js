exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.boolean("privileged_permission").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", (table) => {
    table.boolean("privileged_permission");
  });
};
