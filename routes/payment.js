const express = require("express");
const db = require("../models");
const isAuthenticated = require("../config/isAuthenticated");

const router = express.Router();

router.get("/", isAuthenticated, async (req, res, next) => {
  const usersCount = await db.User.count();
  const serversCount = await db.Server.count();
  const payment = await db.Server.findAll({ raw: true });
  let paymentCount = 0;
  for (let i = 0; i < payment.length; i++) {
    paymentCount += payment[i].price;
  }
  const activeServersCount = await db.Server.count({
    where: {
      status: false,
    },
  });
  const freeServersCount = await db.Server.count({
    where: {
      server_owner: null,
    },
  });
  const usedServersCount = await db.Server.count({
    where: {
      status: true,
    },
  });
  const disabledServersCount = usedServersCount;
  const users = await db.User.findAll({
    where: {
      is_admin: false,
    },
    order: [["createdAt", "DESC"]],
    raw: true,
  });
  const servers = await db.Server.findAll({
    raw: true,
  });
  users.forEach((user) => {
    user.totalServers = 0;
    user.totalActiveServers = 0;
    user.totalDisabledServers = 0;
    for (let server of servers) {
      if (server.server_owner === user.id) {
        user.totalServers += 1;
        if (!server.status) {
          user.totalActiveServers += 1;
        } else {
          user.totalDisabledServers += 1;
        }
      }
    }
  });
  res.render("payment-history", {
    pageTitle: "Payment History",
    user: req.user,
    usersCount,
    serversCount,
    paymentCount,
    usedServersCount,
    freeServersCount,
    activeServersCount,
    disabledServersCount,
    users,
  });
});
module.exports = router;
