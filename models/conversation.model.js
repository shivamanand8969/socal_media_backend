import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    participant:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,ref:"Message"
    }]
})

const Conversation=mongoose.model('conversation',conversationSchema);
export default Conversation;