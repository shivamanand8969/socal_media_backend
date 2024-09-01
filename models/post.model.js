import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    caption:{type:String,default:''},
    image:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    comment:[{type:mongoose.Schema.Types.ObjectId,ref:"Comment"}]
})

export const Post=mongoose.model("Post",postSchema);