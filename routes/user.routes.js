import express from 'express'
import { editProfile, followOrUnfollow, getAllUser, getProfile, login, logout, register } from '../controller/user.controller.js';
import isAuthencated from '../middlewares/isAuthancated.js';
import upload from '../middlewares/multer.js';

const router=express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthencated,getProfile);
router.route('/profile/edit').post(isAuthencated,upload.single('profilePicture'),editProfile)
router.route('/allUsers').

get(isAuthencated,getAllUser);
router.route('/fulloworunfollow/:id').post(isAuthencated,followOrUnfollow);

export default router;