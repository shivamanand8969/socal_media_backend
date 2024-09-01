import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessagge=async(req,res)=>{
    try {
          const senderId=req.id;
          const receiverId=req.params.id;
          const {message}=req.body;

          let conversation=await Conversation.findOne({
            participant:{$all:[senderId,receiverId]}
          }) 

          if(!conversation){
             conversation=await Conversation.create({
                participant:[senderId,receiverId]
             })
          }
          const newmessage=await Message.create({
            senderId,
            recevierId,
            message
          })
          if(newmessage){
            conversation.messages.push(newmessage._id);
            
        }
          await Promise.all([
            await conversation.save(),
            await newmessage.save()
          ])
          // implement socket io connection 
          return res.status(201).json({
            success:true,
            newmessage
          })

    } catch (error) {
          console.log("Error",error);
    }
}

export const getMessage=async (req,res)=>{
    try {
        const senderId=req.id;
        const receiverId=req.params.id;
        const conversation=await Conversation.find({
            participant:{$all:[senderId,receiverId]}
        })

        if(!conversation){
            return res.status(200).json({
                success:true,
                message:[]
            })
        }

        return res.status(200).json({success:true,message:conversation?.messages})
    } catch (error) {
         console.log("Error",error);
    }
}