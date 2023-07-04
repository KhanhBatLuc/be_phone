import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin",
    email: "admin@hunre.edu.vn",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "Thuy Tien",
    email: "thuytien@hunre.edu.vn",
    password: bcrypt.hashSync("123456", 10),
  },
];

export default users;
