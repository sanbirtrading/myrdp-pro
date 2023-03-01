const db = require("../models");
const Sequelize = require("sequelize");

exports.getServer = async (req, res, next) => {
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
    const office_names = ['Italy office', 'Usa office', 'Asia office'];
    let offices_list = [];
    for (let office of office_names){
      let current_office = {
        name: office,
        active: 0,
        disabled: 0,
        price: 0
      };
      let server_for_office = await db.Server.findAll({
        where: {
          server_owner: req.user.id,
          office
        },
        raw: true
      });
      for (let server of server_for_office){
        if (server.status){
          current_office.active += 1;
        } else {
          current_office.disabled += 1;
        }
        current_office.price += +server.price
      }
      offices_list.push(current_office); 
    }
    console.log(offices_list);
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

    const machines = await db.Machine.findAll({
      // where: {
      //   status: true,
      // },
      raw: true,
    });
    if (!req.user.is_admin) {
      // req.user.is_manager
      /*var user_ids = req.user.access_rights
        ? JSON.parse(req.user.access_rights).map((user) => user.id)
        : '';*/

      var usersAll = await db.User.findAll({
        where: {
          id: req.user.id,
        },
      });
      var serversAll = await db.Server.findAll({
        include: db.User,
        raw: true,
        where: {
          server_owner: req.user.id,
        },
      });
    } else {
      var usersAll = await db.User.findAll();
      var serversAll = await db.Server.findAll({
        include: db.User,
        raw: true,
      });
    }

    res.render("server", {
      pageTitle: "Server",
      usersAll,
      serversAll,
      machines,
      user: req.user,
      usersCount,
      serversCount,
      paymentCount,
      usedServersCount,
      freeServersCount,
      activeServersCount,
      disabledServersCount,
      users,
      offices_list
    });
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/server");
  }
};

async function randomString(length, chars) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  const already_exists = await db.Server.findAll({
    raw: true,
    where: {
      unique_id: result,
    },
  });
  return already_exists.length === 0 ? result : randomString(length, chars);
}

exports.postServer = async (req, res, next) => {
  try {
    if (req.body.unique_id && req.body.user) {
      var status = false;
    } else {
      var status = false;
    }
    // The admin doesn't need to request to add a server
    if (!req.user.is_admin) {
      const request = await db.Request.findOne({
        where: {
          request_issuer: parseInt(req.body.user),
        },
      });
      if (!request) {
        throw [{ msg: "Server request doesn't exist for IP!" }];
      }
    }
    if (!("machine" in req.body)) {
      throw [{ msg: "Machine doesn't exist for IP!" }];
    }
    var unique_id = await randomString(4, "0123456789");
    const server = await db.Server.create({
      ip: req.body.ip,
      port: req.body.port,
      server_owner: req.body.user == 0 ? null : parseInt(req.body.user),
      machine_id: parseInt(req.body.machine),
      status: status,
      password: req.body.password,
      unique_id: unique_id,
      cpu: req.body.cpu,
      office: req.body.office,
      ram: req.body.ram,
      hard_disk: req.body.hard_disk,
      admin_password: req.body.admin_password,
      price: req.body.server_price,
    });
    if (!req.user.is_admin) {
      request.resolved = true;
      await request.save();
    }
    req.flash("success_alert_message", "Server has been successfully added!");
    res.redirect(302, "/server");
  } catch (err) {
    if (err.length > 0 && "msg" in err[0]) {
      req.flash("error_message", err[0].msg);
    } else if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    } else {
      req.flash("error_message", err.message);
    }
    res.redirect(303, "/server");
  }
};

exports.getServerByOffice = async (req, res, next) => {
  try {
    const serversAll = await db.Server.findAll({
      where: {
        server_owner: req.user.id,
        office: req.query.office
      },
      raw: true
    });
    const pageHeader = `Server list for ${req.query.office}`;
    const pageTitle = `Servers for ${req.query.office}`;
    res.render('servers-table-by-office', {
      pageTitle,
      pageHeader,
      serversAll,
      office: req.query.office
    });
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/machine");
  }
}


exports.editServer = async (req, res, next) => {
  try {
    const server = await db.Server.findOne({
      where: {
        id: req.params.id,
      },
    });
    if ("status" in req.body) {
      var status = req.body.status;
    } else {
      var status = false;
    }
    
    server.ip = req.body.ip;
    server.port = req.body.port;
    server.password = req.body.password;
    server.server_owner = req.body.user == 0 ? null : parseInt(req.body.user);
    server.cpu = req.body.cpu;
    server.ram = req.body.ram;
    server.status = status;
    server.office = req.body.office;
    server.price = req.body.payment;
    server.hard_disk = req.body.hard_disk;
    server.unique_id = req.body.unique_id;
    await server.save();

    req.flash("success_alert_message", "Server has been successfully updated!");
    res.redirect(302, "/server");
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/server");
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Id: " + id);
    const server = await db.Server.update(
      {
        status: Sequelize.literal("NOT status"),
      },
      { where: { id } }
    );

    req.flash("success_alert_message", "Status successfully changed!");
    res.redirect(302, "/server");
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/server");
  }
};

exports.deleteServer = async (req, res, next) => {
  try {
    const server = await db.Server.findOne({
      where: {
        id: req.params.id,
      },
    });
    await server.destroy();
    req.flash("success_alert_message", "Server has been successfully deleted!");
    res.redirect(302, "/server");
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/server");
  }
};

exports.getServersbyMachine = async (req, res, next) => {
  try {
    // list of servers connected to the passed machine
    const servers = await db.Server.findAll({
      where: {
        machine_id: req.params.id,
      },
      raw: true,
    });
    // machine passed for fronted
    const machine = await db.Machine.findOne({
      where: {
        id: req.params.id,
      },
      raw: true,
    });
    // machines for creating or editing a new server
    const machines = await db.Machine.findAll({
      raw: true,
    });
    const users = await db.User.findAll({
      where: {
        is_admin: false,
      },
      raw: true,
    });
    res.render("servers-by-machine", {
      pageTitle: `Servers connected to machine ${req.params.id}`,
      servers,
      machine,
      machines,
      users,
    });
  } catch (err) {
    if ("errors" in err) {
      req.flash("error_message", err.errors[0].message);
    }
    req.flash("error_message", err.message);
    res.redirect(303, "/machine");
  }
};
