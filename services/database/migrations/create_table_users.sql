create table users(id int not null auto_increment,
      user_id int not null,
      user_name varchar(256) not null, 
      user_email varchar(512),
      user_role varchar(128),
      primary key(id));