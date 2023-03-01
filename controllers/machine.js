const db = require('../models');
const Sequelize = require('sequelize');

exports.getMachine = async (req, res, next) => {
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

    const machines = await db.Machine.findAll({ raw: true });
    if (req.user.is_admin) {
     
      res.render('machines', {
        pageTitle: 'Machines',
        machines: machines,
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

    // const users = await db.User.findAll();
    
    
  } catch (err) {
    if ('errors' in err) {
      req.flash('error_message', err.errors[0].message);
    }
    req.flash('error_message', err.message);
    res.redirect(303, '/server');
  }
};

exports.postMachine = async (req, res, next) => {
  console.log(req);
  try {
    const machine = await db.Machine.create({
      ip: req.body.ip,
      port: req.body.port,
      // machine_owner: req.body.user === null ? 0 : parseInt(req.body.user),
      status: false,
      password: req.body.password,
      cpu: parseInt(req.body.cpu),
      ram: req.body.ram,
      hard_disk: req.body.hard_disk,
      comment: req.body.comment,
    });
    req.flash('success_alert_message', 'Machine has been successfully added!');
    res.redirect(302, '/machine');
  } catch (err) {
    if ('errors' in err) {
      req.flash('error_message', err.errors[0].message);
    }
    req.flash('error_message', err.message);
    res.redirect(303, '/machine');
  }
};

exports.editMachine = async (req, res, next) => {
  try {
    const machine = await db.Machine.findOne({
      where: {
        id: req.params.id,
      },
    });
    if ('status' in req.body) {
      var status = req.body.status;
    } else {
      var status = false;
    }
    console.log(req.body);
    machine.ip = req.body.ip;
    machine.port = req.body.port;
    machine.password = req.body.password;
    machine.cpu = req.body.cpu;
    machine.ram = req.body.ram;
    machine.status = status;
    machine.hard_disk = req.body.hard_disk;
    machine.comment = req.body.comment;
    await machine.save();

    req.flash(
      'success_alert_message',
      'Machine has been successfully updated!'
    );
    res.redirect(302, '/machine');
  } catch (err) {
    if ('errors' in err) {
      req.flash('error_message', err.errors[0].message);
    }
    req.flash('error_message', err.message);
    res.redirect(303, '/machine');
  }
};

exports.deleteMachine = async (req, res, next) => {
  try {
    const machine = await db.Machine.findOne({
      where: {
        id: req.params.id,
      },
    });
    await machine.destroy();
    req.flash(
      'success_alert_message',
      'Machine has been successfully deleted!'
    );
    res.redirect(302, '/machine');
  } catch (err) {
    if ('errors' in err) {
      req.flash('error_message', err.errors[0].message);
    }
    req.flash('error_message', err.message);
    res.redirect(303, '/machine');
  }
};
