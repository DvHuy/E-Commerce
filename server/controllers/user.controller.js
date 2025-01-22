import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generatedOtp from "../utils/generatedOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";

const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({
        message: "Already register email",
        error: true,
        success: false,
        data: user,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const payload = {
      name,
      email,
      password: hashPassword,
    };
    const newUser = new UserModel(payload);
    const save = await newUser.save();

    const verifyEmailUrl = `${process.env.FONTEND_URL}/verify-email?code=${save?._id}`;
    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: "Verify email from binkeyit",
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl,
      }),
    });

    return res.json({
      message: "User register successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await UserModel.findOne({ _id: code });
    if (!user) {
      return res.status(400).json({
        message: "Invalid code",
        error: true,
        success: false,
      });
    }
    const updateUser = await UserModel.updateOne(
      { _id: code },
      { verify_email: true }
    );
    return res.json({
      message: "Verify email done",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "provide email, password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email",
        error: true,
        success: false,
      });
    }
    const checkedPassword = await bcryptjs.compare(password, user.password);
    if (!checkedPassword) {
      return res.status(400).json({
        message: "Invalid password",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//logout
const logoutController = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.updateOne(
      { _id: userId },
      { refresh_token: "" }
    );
    return res.status(200).json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//upload user avatar
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const image = req.file; // from multer middleware
    const upload = await uploadImageCloudinary(image);
    const updateUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { avatar: upload.url }
    );
    return res.status(200).json({
      message: "Upload avatar successfully",
      error: false,
      success: true,
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//update user information
const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { name, email, password, mobile } = req.body;

    let hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashPassword }),
      }
    );

    return res.status(200).json({
      message: "Update user details successfully",
      error: false,
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//forgot password 
const forgotPasswordController = async(req, res)=>{
  try {
    const {email} = req.body;
    
    const user = await UserModel.findOne({email});

    if(!user){
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }
    

    const opt = generatedOtp();
    const expireTime = new Date().getTime() + 60 * 60 * 1000; // 1 hours
   

    const update = await UserModel.findByIdAndUpdate({_id: user._id}, {
      forgot_password_otp: opt,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    })
    
    await sendEmail({
      sendTo: email,
      subject: "Forgot Password OTP",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: opt
      })
    })
    
    return res.status(200).json({
      message: "OTP sent to your email",
      error: false,
      success: true,
    })


  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//verify opt
const verifyForgotPasswordOtp = async(req, res)=>{
  try {
    const {email, otp} = req.body;
    console.log(req.body);
    
    if(!email || !otp){
      return res.status(400).json({
        message: "Provide email and otp",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({email});
    if(!user){
      return res.status(400).json({
        message: "Invalid email",
        error: true,
        success: false,
      });
    }
    
    const currentTime = new Date().toISOString();;
    if(user.forgot_password_expiry < currentTime){
      return res.status(400).json({
        message: "OTP is expired",
        error: true,
        success: false,
      });
    }

    if(user.forgot_password_otp !== otp){
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    //if otp is right
    return res.status(200).json({
      message: "OTP is verified",
      error: false,
      success: true,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

const resetPassword = async(req, res)=>{
  try {
    const {email, newPassword, confirmPassword} = req.body;
    
    if(!email || !newPassword || !confirmPassword){
      return res.status(400).json({
        message: "Provide email, new password and confirm password",
        error: true,
        success: false,
      });
    }
    
    const user = await UserModel.findOne({email});
    if(!user){
      return res.status(400).json({
        message: "Invalid email",
        error: true,
        success: false,
      });
    }
    
    if(newPassword!== confirmPassword){
      return res.status(400).json({
        message: "Password does not match",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);
    const update = await UserModel.findOneAndUpdate({_id: user._id}, {password: hashPassword});
    
    return res.status(200).json({
      message: "Password reset successfully",
      error: false,
      success: true,
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}



//refresh token
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req?.headers.authorization.split(" ")[1];
    
    if(!refreshToken){
      return res.status(401).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN); 
    if(!verifyToken){
      return res.status(401).json({
        message: "Token is invalid",
        error: true,
        success: false,
      });
    }
    const userId = verifyToken._id;
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const newAccessToken = await generatedAccessToken(userId);
    await res.cookie("accessToken", newAccessToken, cookiesOption);
    
    return res.status(200).json({
      message: "Refresh token successfully",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  uploadAvatar,
  updateUserDetails,
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetPassword,
  refreshToken
};
