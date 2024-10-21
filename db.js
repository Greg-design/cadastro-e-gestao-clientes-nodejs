const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const PAGE_SIZE = 5;

async function connect() {
  if (global.connection) return global.connection;

  const cliente = new MongoClient(process.env.MONGODB_CONNECTION);

  try {
    await cliente.connect();
    global.connection = cliente.db(process.env.MONGODB_DATABASE);
    console.log("Connected!");
  } catch (err) {
    console.log(err);
    global.connection = null;
  }

  return global.connection;
}

async function countCustomers() {
  const connection = await connect();
  return connection.collection("customers").countDocuments();
}

// busca por clientes
async function findCustomers(page = 1) {
  const totalSkip = (page - 1) * PAGE_SIZE;
  const connection = await connect();
  return connection.collection("customers").find({}).skip(totalSkip).limit(PAGE_SIZE).toArray();
}

async function findCustomer(id) {
  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("customers").findOne({ _id: objectId });
}

async function insertCustomer(customer) {
  const connection = await connect();
  return connection.collection("customers").insertOne(customer);
}

async function updateCustomer(id, customer) {
  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("customers").updateOne({ _id: objectId }, { $set: customer });
}

async function deleteCustomer(id) {
  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("customers").deleteOne({ _id: objectId });
}

// users

async function countUsers() {
  const connection = await connect();
  return connection.collection("users").countDocuments();
}

// busca por usuários
async function findUsers(page = 1) {
  const totalSkip = (page - 1) * PAGE_SIZE;
  const connection = await connect();
  return connection.collection("users").find({}).skip(totalSkip).limit(PAGE_SIZE).toArray();
}

async function findUser(id) {
  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("users").findOne({ _id: objectId });
}

async function insertUser(user) {
  user.password = bcrypt.hashSync(user.password, 12);

  const connection = await connect();
  return connection.collection("users").insertOne(user);
}

async function updateUser(id, user) {
  if (user.password) {
    user.password = bcrypt.hashSync(user.password, 12);
  }

  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("users").updateOne({ _id: objectId }, { $set: user });
}

async function deleteUser(id) {
  const objectId = ObjectId.createFromHexString(id);
  const connection = await connect();
  return connection.collection("users").deleteOne({ _id: objectId });
}

module.exports = {
  findCustomers,
  insertCustomer,
  updateCustomer,
  deleteCustomer,
  findCustomer,
  countCustomers,
  PAGE_SIZE,
  findUser,
  countUsers,
  findUsers,
  insertUser,
  updateUser,
  deleteUser,
  connect,
};
