import sharp from "sharp";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudnary.js";
import { Post } from "../models/post.model.js";
import Comment from "../models/comment.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        if (!image) {
            return res.status(400).json({ message: "Image Required" });
        }
        let user = await User.findById(authorId);
        const optimizedImageBuffer = await sharp(image.buffer).resize({ width: 800, height: 800, fit: 'inside' }).toFormat('jpeg', { quality: 80 }).toBuffer();
        //buffer to data uri
        const fileUri=`data:image/jpef:base64${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse=await cloudinary.uploader.upload(fileUri);

        const post =await Post.create({caption,image:cloudResponse.secure_url,author:authorId});
        if(!user){
            user.post.push(post._id);
             await user.save();
        }
        await post.populate({path:'author',select:'-password'});
        return res.status(200).json({
            message:"New post Added",
            post,
            success:true
        })

    } catch (error) {
        console.log("Error",error);

    }
}

export const getAllPost=async ()=>{
    try {
         const post =await Post.find().sort({createdAt:-1}).populate({path:"author",select:'username , profilePicture'})
         .populate({
            path:"comments",
            sort:{createdAt:-1},
            populate:{
                path:"author",
                select:'username,profilePicture'
            }
         });
         return res.status(200).json({
            posts,
            success:true
         })
    } catch (error) {
        console.log("Error",error)
    }
}

export const getUserPost=async (req,res)=>{
     try {
         const authorId=req.id;
         const posts=await Post.find({author:authorId}).sort({createdAt:-1}).populate({
            path:"author",
            select:'username, profilePicture',
         }).populate({
            path:"comments",
            sort:{createdAt:-1}
         })
         return res.status(200).json({
            posts,
            success:true
         })
     } catch (error) {
          console.log("Error",error);
     }
}

export const likePost=async ()=>{
     const UserWantToLikes=req.id;
     const postId=req.params.id;
     try {
        const post=await Post.findById(postId);

        if(!post) return res.status(404).json({
           message:"post does't exist"
        })
        
        await post.updateOne({$addToSet:{likes:UserWantToLikes}})
        await post.save();
        ///socket io for real time notification...

        return res.status(200).json({message:"Post Liked",success:true});
     } catch (error) {
          console.log("Error",error);
     }
}

export const disLikePost=async ()=>{
     const UserWantToLikes=req.id;
     const postId=req.params.id;
     try {
        const post=await Post.findById(postId);

        if(!post) return res.status(404).json({
           message:"post does't exist"
        })
        
        await post.updateOne({$pull:{likes:UserWantToLikes}})
        await post.save();
        ///socket io for real time notification...

        return res.status(200).json({message:"Post Liked",success:true});
     } catch (error) {
          console.log("Error",error);
     }
}

export const addComment=async (req,res)=>{
    try {
          const postId=req.params.id;
          const UserWantToComment=-req.id; 
          const {text}=req.body;
          const post=await Post.findById(postId);
          if(!text) return res.status(400).json({message:"text is required.",success:true});

          const comment=await Comment.create({
            text,
            author:UserWantToComment,
            post:postId
          }).populate({path:'author',select:'username,profilePicture'})
          
          post.comments.push(comment._id);
          await post.save();

          return res.status(201).json({
            message:"Comment Added",
            success:true
          })

    } catch (error) {
         console.log("Error",error);
    }
}

export const getCommentByPostId=async ()=>{
        try {
            const postId=req.params.id;
            const comments=await Comment.find({post:postId}).populate('author','username,profilePicture');
            if(!comments){
                return res.status(404).json({message:"No- comments",success:false});
            }
            return res.status(200).json({success:true,comments});

        } catch (error) {
            console.log("Error",error);
        }
}

export const deletePost=async(req,res)=>{
    try {
          let postId=req.params.id;
          let authorId=req.id;

          const post=await Post.findById(postId);
          const user=await User.findById(authorId);
          if(!post){
            return res.status(404).json({
                message:"Post Not Found",
                success:false
            })
          }

          if(post.author.toString()!==authorId){
            return res.status.json({message:"UnAuthorized",success:false});
          }
          await Post.findByIdAndDelete(postId);
          user.posts=user.posts.filter(id=>id.toString()!==postId);
          await user.save();
          
          //delete assoicated comment.
          await Comment.deleteMany({post:postId})
          return res.status(200).json({
            message:"Post Deleted",
            success:true
          })
       
    } catch (error) {
          console.log("Error",error);
    }
}

export const bookmarkpost=async (req,res)=>{
    try {
         const postId=req.params.id
         const authorId=req.id;
         const post=await Post.findById(postId);
         if(!post){
            return res.status(404).json({
                message:"Post Not found",
                success:true
            })
         }
         const user=await User.findById(authorId);
         if(user.bookmarks.includes(post._id)){
            //remove from the bookmarks
           await user.updateOne({$pull:{bookmarks:post._id}});
           await user.save();
           res.status(200).json({
            message:"post remove from bookmark",
            type:'unsaved',
            success:true
           })
         }else{
           await user.updateOne({$addToSet:{bookmarks:post._id}});
           await user.save();
           return res.status(200).json({
            message:"Post added into bookmars",
            type:'save',
            success:true
           }) 
        };

    } catch (error) {
        console.log("Errror",error)
    }
}