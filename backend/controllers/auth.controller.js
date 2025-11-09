// import { redis } from "../lib/redis.js";
// Temporary in-memory store for refresh tokens
const refreshTokenStore = new Map();
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET || 'access_token_secret', {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret', {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  // Store in memory temporarily
  refreshTokenStore.set(`refresh_token:${userId}`, refreshToken);
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  
  if (!req.body) {
    return res.status(400).json({ message: "No request body received" });
  }
  
  const { email, password, name } = req.body;
  console.log('Signup attempt:', { email, name, passwordLength: password?.length });
  
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: "All fields are required",
        received: { name, email, password: password ? "[hidden]" : undefined }
      });
    }
    
    console.log('Checking if user exists...');
    const userExists = await User.findOne({ email });
    console.log('User exists check result:', !!userExists);

    if (userExists) {
      console.log('User already exists, returning error');
      return res.status(400).json({ message: "User already exists" });
    }
    
    console.log('User does not exist, proceeding with creation...');
    
    console.log('Creating user...');
    const user = await User.create({ name, email, password });
    console.log('User created successfully:', user._id);

    // authenticate
    console.log('Generating tokens...');
    const { accessToken, refreshToken } = generateTokens(user._id);
    console.log('Tokens generated');
    
    console.log('Storing refresh token...');
    await storeRefreshToken(user._id, refreshToken);
    console.log('Refresh token stored');

    console.log('Setting cookies...');
    setCookies(res, accessToken, refreshToken);
    console.log('Cookies set');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    console.log("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (user) {
      console.log('Comparing password...');
      const passwordMatch = await user.comparePassword(password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        console.log('Login successful, generating tokens...');
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        console.log('Password mismatch');
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      console.log('User not found');
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshTokenStore.delete(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = refreshTokenStore.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to update password" });
      }
      
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      user.password = newPassword;
    }

    // Update other fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select("-password");
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  const { email, password, name, adminKey } = req.body;
  
  // Simple admin key check (you can make this more secure)
  if (adminKey !== "ADMIN_SECRET_2024") {
    return res.status(403).json({ message: "Invalid admin key" });
  }
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: "admin" 
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in createAdmin controller", error.message);
    res.status(500).json({ message: error.message });
  }
};
