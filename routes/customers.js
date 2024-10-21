const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/new", (req, res) => {
  res.render("newCustomer", { title: "Cadastro de cliente", customer: {} });
});

router.get("/edit/:customerId", (req, res) => {
  const id = req.params.customerId;
  db.findCustomer(id)
    .then((customer) => res.render("newCustomer", { title: "Edição de cadastro", customer }))
    .catch((error) => {
      console.log(error);
      res.render("error", { message: "Não foi possível retornar os dados do cliente.", error });
    });
});

router.get("/delete/:customerId", (req, res) => {
  const id = req.params.customerId;
  db.deleteCustomer(id)
    .then((result) => res.redirect("/customers"))
    .catch((error) => {
      console.log(error);
      res.render("error", { message: "Não foi possível excluir o cliente.", error });
    });
});

router.post("/new", (req, res) => {
  if (!req.body.nome) {
    return res.redirect("/customers/new?error=O campo nome é obrigatório");
  }

  if (!req.body.cpf || !/^\d{11}$/.test(req.body.cpf)) {
    return res.redirect("/customers/new?error=O campo CPF é obrigatório e deve ter 11 dígitos");
  }

  const id = req.body.id;
  const nome = req.body.nome;
  const cpf = req.body.cpf;
  const cidade = req.body.cidade;
  const uf = req.body.uf.length > 2 ? "" : req.body.uf;

  const customer = { nome, cpf, cidade, uf };
  const promise = id ? db.updateCustomer(id, customer) : db.insertCustomer(customer);

  promise
    .then((result) => {
      res.redirect("/customers");
    })
    .catch((error) => {
      console.log(error);
      res.render("error", { message: "Não foi possível salvar o cliente.", error });
    });
});

/* GET customers page. */
router.get("/:page?", async (req, res, next) => {
  const page = parseInt(req.params.page);

  try {
    const qtd = await db.countCustomers();
    const pagesQtd = Math.ceil(qtd / db.PAGE_SIZE);
    const customers = await db.findCustomers(page);
    res.render("customers", { title: "Clientes", customers, qtd, pagesQtd, page });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "Não foi possível listar os clientes.", error });
  }
});

module.exports = router;
