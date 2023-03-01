const db = require("../models");
const Sequelize = require("sequelize");
const Op = require("sequelize").Op;
const isEmail = require("../config/isEmail");
const isUsername = require("../config/isUsername");
const { validationResult } = require("express-validator");
const { notify } = require("../routes/auth");
const { removeAllListeners } = require("nodemon");

exports.getUser = async (req, res, next) => {
  try {
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
    if (req.user.is_admin) {
      res.render("normal-users", {
        pageTitle: "User",
        usersCount,
        serversCount,
        paymentCount,
        usedServersCount,
        freeServersCount,
        activeServersCount,
        disabledServersCount,
        users,
      });
    } else {
      res.redirect(303, "/server");
    }
  } catch (err) {
    res.json(err);
    console.log(err);
    res.status(422).json(err.errors[0].message);
  }
};

exports.displayUserData = async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: {
        id: req.params.id
      },
      raw: true
    });
    const serversAll = await db.Server.findAll({
      where: {
        server_owner: req.params.id
      },
      raw: true
    });
    const machines = await db.Machine.findAll({
      raw: true
    });
    const usersAll = await db.User.findAll({
      raw: true
    })
    if (req.user.is_admin){
      res.render("edit-user", 
      {
        pageTitle: `Edit ${user.first_name} ${user.last_name}`,
        user,
        serversAll,
        machines,
        usersAll,
      });
    } else {
      throw "Not authorized to access this page";
    }
  } catch (err) {
    res.json(err);
    res.status(422).json(err.errors[0].message);
  }
}

exports.getIpWhitelistforUser = async (req,res,next) => {
  try {
    const user = await db.User.findOne({
      where: {
        id: req.params.id
      },
      raw: true
    });
    const ips = await db.IPWhitelist.findAll({
      where: {
        ip_owner: req.params.id
      },
      raw: true
    });
    const status = {
      delete: true
    };
    res.render('ip-for-user', {
      pageTitle: `Ip whitelist for ${user.first_name} ${user.last_name}`,
      ips,
      status,
      user
    });
  } catch (err) {
    res.json(err);
    console.log(err);
    res.status(422).json(err.errors[0].message);
  }
}

exports.getSubUser = async (req, res, next) => {
  try {
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

    const usersAll = await db.User.findAll({
      where: {
        is_manager: true,
        parent_user: req.user.id,
      },
      raw: true,
    });
    const normalUsers = await db.User.findAll({
      where: {
        is_manager: false,
        is_admin: true,
      },
      raw: true,
    });
    var serverList = [];
    for (var i = 0; i < usersAll.length; i++) {
      serverList.push([]);
      if (usersAll[i].parent_id) {
        usersAll[i].parent_id.split(" ").forEach((server) => {
          server.split("-").forEach((item, count) => {
            if (count !== 0) {
              if (count === 2) {
                serverList[i].push(`${item},`);
              } else {
                serverList[i].push(item);
              }
            }
          });
        });
      }
    }
    res.render("sub-user", {
      pageTitle: "Users",
      usersAll,
      normalUsers,
      serverList,
      usersCount,
      serversCount,
      paymentCount,
      usedServersCount,
      freeServersCount,
      activeServersCount,
      disabledServersCount,
      users,
    });
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
  }
};

exports.postSubUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    }
    const username = await isUsername(req.body.username);

    if (username) {
      throw [
        {
          msg: "Username already exists!",
        },
      ];
    }
    const email = await isEmail(req.body.email);
    if (email) {
      throw [
        {
          msg: "Email already exists!",
        },
      ];
    }
    const body = req.body;
    const server_list_exists = "server_list" in body;
    var parent_id = "";
    if (server_list_exists) {
      if (!Array.isArray(req.body.server_list)) {
        var server_split = req.body.server_list.split(" ");
        parent_id = `${server_split[0]}-${server_split[1]}-${server_split[2]}`;
      } else {
        for (server of req.body.server_list) {
          var server_split = server.split(" ");
          parent_id += `${server_split[0]}-${server_split[1]}-${server_split[2]} `;
        }
      }
    } else {
      parent_id = null;
    }
    const user = await db.User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      is_manager: true,
      parent_id: parent_id,
      parent_user: req.user.id,
    });
    req.flash("success_alert_message", "User has been created!");
    res.redirect(303, "/user/sub-users");
  } catch (err) {
    if (err.length > 0 && "msg" in err[0]) {
      req.flash("error_message", err[0].msg);
    } else if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    } else {
      req.flash("error_message", err[0].msg);
    }
    res.redirect(303, "/user/sub-users");
  }
};

exports.editSubUser = async (req, res, next) => {
  try {
    const user = await db.User.findOne({ where: { id: req.params.id } });
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.email = req.body.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    await user.save();
    req.flash("success_alert_message", "User has been updated!");
    res.redirect(303, "/user/sub-users");
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/user/sub-users");
  }
};

exports.deleteSubUser = async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: req.params.id },
    });
    await user.destroy();
    req.flash("success_alert_message", "User has been deleted!");
    res.redirect(303, "/user/sub-users");
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/user/sub-users");
  }
};

exports.editUser = async (req, res, next) => {
  try {
    const user = await db.User.findOne({ where: { id: req.body.id } });
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.email = req.body.email;
    await user.save();
    req.flash("success_alert_message", "User has been updated!");
    res.redirect(303, "/user");
  } catch (err) {
    req.flash("error_message", err);
    console.log(err);
    res.redirect(303, "/user");
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw errors.array();
    }
    const username = await isUsername(req.body.username);

    if (username) {
      throw [
        {
          msg: "Username already exists!",
        },
      ];
    }
    const email = await isEmail(req.body.email);
    if (email) {
      throw [
        {
          msg: "Email already exists!",
        },
      ];
    }
    const user = await db.User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    req.flash("success_alert_message", "User has been created!");
    res.redirect(303, "/user");
  } catch (err) {
    if (err.length > 0 && "msg" in err[0]) {
      req.flash("error_message", err[0].msg);
    } else if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    } else {
      req.flash("error_message", err[0].msg);
    }
    res.redirect(303, "/user");
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    db.User.destroy({
      where: {
        id: req.params.id,
      },
    });
    req.flash("success_alert_message", "User has been deleted!");
    res.redirect(303, "/user");
  } catch (err) {
    req.flash("error_message", err.msg);
    res.redirect(303, "/user");
  }
};
