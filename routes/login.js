const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../auth");
const sendMail = require("../mail");
const passport = require("passport");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("login", { title: "Login", message: "" });
});

router.get("/forgot", (req, res, next) => {
  res.render("forgot", { title: "Recuperação de senha", message: "" });
});

router.post("/logout", (req, res, next) => {
  req.logOut(() => {
    res.redirect("/");
  });
});

// recuperaçao de senha
router.post("/forgot", async (req, res, next) => {
  const email = req.body.email;
  if (!email) return res.render("forgot", { title: "Recuperação de senha", message: "O email é obrigatório" });

  const user = await auth.findUserByEmail(email);
  if (!user) return res.render("forgot", { title: "Recuperação de senha", message: "O usuário não existe" });

  const newPassword = auth.generatePassword();
  user.password = newPassword;

  try {
    await db.updateUser(user._id.toString(), user);
    await sendMail(
      user.email,
      "Senha alterada com sucesso",
      `
      Olá ${user.nome}!
      Sua senha foi alterada com sucesso para ${newPassword}.
      Use-a para se autenticar novamente em http://localhost:3000/

      att.
      Admin
    `
    );

    res.render("login", { title: "Login", message: "Verifique sua caixa de email" });
  } catch (err) {
    res.render("forgot", { title: "Recuperação de senha", message: err.message });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/?message=Usuário e/ou senha inválidos.",
  })
);

module.exports = router;
