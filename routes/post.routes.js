import express from 'express'
import isAuthencated from '../middlewares/isAuthancated.js';
import upload from '../middlewares/multer.js';
import { addComment, addNewPost, bookmarkpost, deletePost, disLikePost, getAllPost, getCommentByPostId, getUserPost, likePost } from '../controller/post.controller.js';

const router=express.Router();
router.route("/addpost").post(isAuthencated,upload.single('image'),addNewPost);
router.route('/all').get(isAuthencated,getAllPost);
router.route('/userpost/all').get(isAuthencated,getUserPost)
router.route('/:id/like').get(isAuthencated,likePost)
router.route('/:id/dislike').get(isAuthencated,disLikePost);
router.route('/:id/comment').post(isAuthencated,addComment);
router.route('/:id/comment/all').post(isAuthencated,getCommentByPostId);
router.route('/delete/:id').delete(isAuthencated,deletePost);
router.route('/:id/bookmark').post(isAuthencated,bookmarkpost);

export default router;
