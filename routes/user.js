const passport = require('passport');
const express = require('express');
const { body } = require('express-validator');
const isAuthenticated = require('../config/isAuthenticated');
const UserController = require('../controllers/user');
const { userData } = require('../controllers/auth');

const router = express.Router();

router.post(
  '/sub-users',
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email must be correct!'),
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('first_name')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('last_name')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 chars long!'),
  isAuthenticated,
  UserController.postSubUser
);
router.get('/sub-users', isAuthenticated, UserController.getSubUser);
router.post(
  '/sub-users/delete/:id',
  isAuthenticated,
  UserController.deleteSubUser
);
router.post('/sub-users/edit/:id', isAuthenticated, UserController.editSubUser);

router.post('/edit-user', isAuthenticated, UserController.editUser);
router.post('/delete-user/:id', isAuthenticated, UserController.deleteUser);
router.post(
  '/add-user',
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email must be correct!'),
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('first_name')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('last_name')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage('Field must not be empty!'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 chars long!'),
  isAuthenticated,
  UserController.addUser
);
router.get('/', isAuthenticated, UserController.getUser);
router.get('/:id/edit', isAuthenticated, UserController.displayUserData);
router.get('/:id/edit/ip', isAuthenticated, UserController.getIpWhitelistforUser);
module.exports = router;
