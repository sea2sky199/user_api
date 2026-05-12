exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.json("WebSSO_meta");
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("WebSSO_meta");
  });
};
