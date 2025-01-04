import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloud } from "../utils/Cloudinary.js";

//* token generate method >>>>>>>>>>>>>>>>>>>>>>
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Some thing went wrong while generating access and refresh tokens."
    );
  }
};
//* Register User controller  route===================================>
const registerUser = asyncHandler(async (req, res) => {
  //  Write down ths steps
  // 1. Get user details from frontend
  const { username, fullName, email, password } = req.body;
  // 2. Validation - not empty
  if (
    [username, fullName, email, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }
  // 3. Check user is already exists: name , email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }
  // 4. Check for images, check for avatar

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required path not found.");
  }
  // 5. Upload to them cloudinary, avatar check
  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverImage = await uploadOnCloud(coverImageLocalPath);

  if (!avatar || !coverImage) {
    throw new ApiError(
      400,
      "Avatar and coverImage file is required after cloudinary response"
    );
  }
  // 6. Create user object,
  // 7. Create entry in database
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    avatar: avatar,
    coverImage: coverImage,
    email,
    password,
  });
  // Exclude password and refreshToken from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 9. Check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // 10. Return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully."));
});
//* Login User controller  route===================================>
const loginUser = asyncHandler(async (req, res) => {
  // 1. get data from req body
  const { username, email, password } = req.body;
  // 2. username or email based login
  if (!username && !email) {
    throw new ApiError(400, "Email or user name is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User dose not exists.");
  }
  // 4. password check
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials.");
  }
  // 5. Generate Access or Refresh Token
  const tokens = await generateAccessAndRefreshTokens(user._id);
  const { accessToken, refreshToken } = tokens;

  // find the updated user he has refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // 6. Set Token to Cookie and Send Response
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  // checking

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});
//* Logout user route==================================>
const logoutUser = asyncHandler(async (req, res) => {
  //  logout user
  // 1. Inject a middleware that ste the user to req.user
  // 2. find user by req.user._id  and delete refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  // 3. remove all the cookies from the user and send response
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

//* Refresh accessToken controller ==================================>
const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Get incoming refresh token and check if it exists.
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token missing");
  }

  // 2. Verify and decode the token.
  let decodedToken;
  try {
    decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET // Corrected from ACCESS_TOKEN_SECRET to REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Unauthorized request: Invalid refresh token");
  }

  // 3. Find user by decoded user ID and check if they exist.
  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Unauthorized request: User not found");
  }

  // 4. Check if the incoming refresh token matches the one stored in the user's record.
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token mismatch");
  }

  // 5. Generate new tokens and update the user's refresh token in the database.
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  user.refreshToken = refreshToken;
  await user.save();

  // 6. Set the new tokens in cookies and return them in the response.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict", // Helps prevent CSRF attacks
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        refreshToken,
      },
      "Access token refreshed successfully"
    )
  );
});
//* Change Current password route ==================================>
const changeCurrentPassword = asyncHandler(async (req, res) => {
  //  use middleware user logged in or not and set user to req
  // 1. get {oldPassword, newPassword} req.body
  const { oldPassword, newPassword } = req.body;
  // 2. find user by req.user.id
  const user = await User.findById(req.user._id);
  // 3. and check is password correct |! throw err
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  // 4. set user.password = newPassword and save validateBeforeSave : false
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  // 5. send success res to user
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
//* Get current user controller ==================================>
const getCurrentUser = asyncHandler(async (req, res) => {
  //  use middleware user logged in or not and set user to req
  //. 1 send response req.user
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
//* Update account details controller ==================================>
const updateAccountDetails = asyncHandler(async (req, res) => {
  //  use middleware user logged in or not and set user to req
  // 1. get data from req.body and check empty throw an error
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  // 2. update findByIdAndUpdate  by $set and new: true & select("-password")
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  );
  // 3. return res to the user
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});
//* Update avatar controller ==================================>
const updateAvatar = asyncHandler(async (req, res) => {
  // user multer middleware to handle file
  // use middleware user logged in or not and set user to req
  // 1. get localPath of the file req.file.path and check exists |! err.
  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }
  // 2. upload avatar on cloudinary and check is uploaded |! err
  const avatar = await uploadOnCloud(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar on cloudinary");
  }
  // 3. findByIdAndUpdate  by $set and new: true & select("-password")
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar,
      },
    },
    { new: true }
  ).select("-password");
  // return success response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile picture updated successfully."));
});
//* Update cover image controller ==================================>
const updateCoverImage = asyncHandler(async (req, res) => {
  // user multer middleware to handle file
  // use middleware user logged in or not and set user to req
  // 1. get localPath of the file req.file.path and check exists |! err.
  const coverImageLocalPath = req?.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }
  // 2. upload avatar on cloudinary and check is uploaded |! err
  const coverImage = await uploadOnCloud(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Error while uploading cover image on cloudinary");
  }
  // 3. findByIdAndUpdate  by $set and new: true & select("-password")
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage,
      },
    },
    { new: true }
  ).select("-password");
  // return success response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully."));
});
//* Get user chanel profile controller ==================================>
const getUserChanelProfile = asyncHandler(async (req, res) => {
  // use middleware user logged in or not and set user to req
  // 1. get value from req.params and check is exists |! err
  // 2. make a aggregation pipeline
  const username = req.params.username;

  if (!username) {
    throw new ApiError(400, "Username is missing");
  }
  // 2. make a aggregation pipeline
  const channel = await User.aggregate([
    // pipeline 1
    {
      //$match স্টেজটি User কালেকশনে নির্দিষ্ট শর্ত অনুযায়ী ডকুমেন্টগুলো ফিল্টার করে।
      $match: {
        username: username,
      },
    },
    // pipeline 2 সাবস্ক্রাইবার খুঁজে বের করা
    {
      $lookup: {
        from: "subscriptions", //from: means, যেই কালেকশন থেকে সাথে জয়েন করবে
        localField: "_id", //localField: User কালেকশনের যেই ফিল্ডটি ম্যাচ করানো হবে
        foreignField: "channel", // subscription কালেকশনের যেই ফিল্ডটি localField এর সাথে ম্যাচ করবে
        as: "subscribers",
      },
    },
    // pipeline 3  generate subscribed to
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // pipeline 4
    {
      // $addFields: স্টেজটি ডকুমেন্টগুলিতে নতুন ফিল্ড যোগ করে।
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", // tell me the total number of subscribers
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo", // tell me the total number of subscribed to
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    // pipeline 5
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  //  3. check chanel exists
  if (!channel.length) {
    throw new ApiError(404, "Channel dose not exists");
  }
  // 4. Return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully.")
    );
});
//* Get watch history controller  ==================================>
const getWatchHistory = asyncHandler(async (req, res) => {
  // use middleware user logged in or not and set user to req
  const user = await User.aggregate([
    // stage - 1
    // Find the user by req.user._id
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    // stage -2
    // find watch history
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "owner",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully."
      )
    );
});

export {
  changeCurrentPassword,
  getCurrentUser,
  getUserChanelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};
