import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudnary.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !password || !email) {
            return res.status(401).json({
                message: "Something is missing, Please Check",
                success: true
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "try different account",
                success: true
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({
            message: "Account Created Successfully",
            success: true
        })
    } catch (error) {
        console.log("Error in register", error)
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({
            message: "Something is missing, Please Check",
            success: true
        })
    }
    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Incorrect Email or password",
            success: false
        })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).json({
            message: "Incorrect email or password",
            success: false
        })
    }
    const token = await JWT.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: 1 * 24 * 60 * 60 * 1000 * 1000 });
      let populatedPosts=await Promise.all(
        user.posts.map(async (postId)=>{
            const post=await Post.findById(postId);
            if(post.author.equals(user._id)){
                return post;
            }
            return null;
        })
      )

    user = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        posts: populatedPosts
    }

    return res.cookie('token', token, {
        httpOnly: true, sameSite: "strict", maxAge: 1 * 24 * 60 * 60 * 1000 * 1000
    }).json({
        message: `Welcome back ${user.username}`,
        success: true,
        user
    })

}

export const logout = async (_, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            message: "Logout successfully",
            success: true
        })
    } catch (error) {
        console.log("error", error)

    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId);
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log("Error", error);
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        let cloudResponse;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;
        await user.save();
        return res.status(200).json({
            message: "Profile Updated",
            success: true,
            user
        })
    } catch (error) {
        console.log("Error", error);
    }
}


export const getAllUser = async (req, res) => {
    try {
        const allUser = await User.find({ _id: { $ne: req.id } }).select('-password');
        if (!allUser) {
            return res.status(404).json({
                message: "Currently there is no any user"
            })
        }
        return res.status(200).json({
            users: allUser,
            success: true
        })
    } catch (error) {
        console.log("Error", error);
    }
}


export const followOrUnfollow = async (req, res) => {
    try {
        const personWantToFollow = req.id;
        const personWillFollowed = req.params.id;

        if (personWantToFollow == personWillFollowed) {
            return res.status(400).json({
                message: "you can follow your self"
            })
        }

        const user = await User.findById(personWantToFollow);
        const targetUser = await User.findById(personWillFollowed);
        if (!user || !targetUser) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }
        const isFollowing = user.following.includes(personWillFollowed);
        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: personWantToFollow }, { $pull: { following: personWillFollowed } }),
                User.updateOne({ _id: personWillFollowed }, { $pull: { follower: personWantToFollow } })
            ])
            return res.status(200).json({
                messsge: "Unfollow successfully",
                success: true
            })
        } else {
            await Promise.all([
                User.updateOne({ _id: personWantToFollow }, { $push: { following: personWillFollowed } }),
                User.updateOne({ _id: personWillFollowed }, { $push: { follower: personWantToFollow } })
            ])
            return res.status(200).json({
                messsge: "follow successfully",
                success: true
            })
        }

    } catch (error) {
        console.log("Error", error);
    }
}