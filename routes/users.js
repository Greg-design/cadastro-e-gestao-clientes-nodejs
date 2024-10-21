const express = require("express");
const router = express.Router();
const db = require("../db");
const sendMail = require("../mail");

router.get("/new", (req, res) => {
  res.render("newUser", { title: "Cadastro de usuário", user: {} });
});

router.get("/edit/:userId", (req, res) => {
  const id = req.params.userId;
  db.findUser(id)
    .then((user) => res.render("newUser", { title: "Edição de usuário", user }))
    .catch((error) => {
      console.log(error);
      res.render("error", { message: "Não foi possível retornar os dados do usuário.", error });
    });
});

router.get("/delete/:userId", (req, res) => {
  const id = req.params.userId;
  db.deleteUser(id)
    .then((result) => res.redirect("/users"))
    .catch((error) => {
      console.log(error);
      res.render("error", { message: "Não foi possível excluir o usuário.", error });
    });
});

router.post("/new", async (req, res) => {
  const id = req.body.id;

  if (!req.body.nome) {
    return res.redirect("/users/new?error=O campo nome é obrigatório");
  }

  if (!id && !req.body.password) {
    return res.redirect("/users/new?error=O campo Senha é obrigatório");
  }

  const nome = req.body.nome;
  const email = req.body.email;
  const profile = parseInt(req.body.profile);

  const user = { nome, email, profile };
  if (req.body.password) {
    user.password = req.body.password;
  }

  try {
    (await id) ? db.updateUser(id, user) : db.insertUser(user);

    await sendMail(
      user.email,
      "Usuário criado com sucesso",
      `
    Olá ${user.nome}!
    Seu usuário foi criado com sucesso.
    Use sua senha para se autenticar em http://localhost:3000/

    att.
    Admin
  `
    );

    res.redirect("/users");
  } catch (error) {
    console.error(error);
    res.redirect("/users/new?error=" + error.message);
  }
});

/* GET customers page. */
router.get("/:page?", async (req, res, next) => {
  const page = parseInt(req.params.page);

  try {
    const qtd = await db.countUsers();
    const pagesQtd = Math.ceil(qtd / db.PAGE_SIZE);
    const users = await db.findUsers(page);
    res.render("users", { title: "Usuários", users, qtd, pagesQtd, page });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "Não foi possível listar os usuários.", error });
  }
});

module.exports = router;
