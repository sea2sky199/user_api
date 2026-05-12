exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("users").insert([
        {
          id: 1,
          user_id: 111,
          name: "Local Developer",
          email: "dev@localhost",
          role: "ADMIN",
          privileged_permission: true,
        },
        {
          id: 2,
          user_id: 100,
          name: "User 100",
          email: "100@localhost",
          role: "GUEST",
        },
        {
          id: 3,
          user_id: 101,
          name: "User 101",
          email: "101@localhost",
          role: "GUEST",
        },
        {
          id: 4,
          user_id: 102,
          name: "User 102",
          email: "102@localhost",
          role: "GUEST",
        },
        {
          id: 5,
          user_id: 103,
          name: "User 103",
          email: "103@localhost",
          role: "GUEST",
        },
        {
          id: 6,
          user_id: 5005000,
          name: "User 55",
          email: "55@localhost",
          role: "USER",
        },
      ]);
    });
};
