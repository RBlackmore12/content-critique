import { Router } from "express";
import { db } from "../db";
import { users, inviteCodes } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, comparePassword, generateToken, requireAuth, requireAdmin } from "./auth";
import crypto from "crypto";

const router = Router();

// Generate invite code (admin only)
router.post("/admin/invite", requireAuth, requireAdmin, async (req, res) => {
  try {
    const code = crypto.randomBytes(16).toString("hex");
    
    await db.insert(inviteCodes).values({
      code,
      isUsed: false,
    });
    
    res.json({ 
      inviteCode: code,
      inviteUrl: `${req.protocol}://${req.get("host")}/signup?invite=${code}`
    });
  } catch (error) {
    console.error("Error generating invite:", error);
    res.status(500).json({ error: "Failed to generate invite code" });
  }
});

// Signup with invite code
router.post("/signup", async (req, res) => {
  try {
    const { email, password, inviteCode } = req.body;
    
    if (!email || !password || !inviteCode) {
      return res.status(400).json({ error: "Email, password, and invite code required" });
    }
    
    // Verify invite code
    const [invite] = await db
      .select()
      .from(inviteCodes)
      .where(and(
        eq(inviteCodes.code, inviteCode),
        eq(inviteCodes.isUsed, false)
      ));
    
    if (!invite) {
      return res.status(400).json({ error: "Invalid or already used invite code" });
    }
    
    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    // Create user
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        inviteCode,
        isActive: true,
        isAdmin: false,
      })
      .returning();
    
    // Mark invite as used
    await db
      .update(inviteCodes)
      .set({ isUsed: true, usedBy: newUser.id, usedAt: new Date() })
      .where(eq(inviteCodes.code, inviteCode));
    
    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
    
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: "Account deactivated" });
    }
    
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/me", requireAuth, async (req, res) => {
  const { userId } = (req as any).user;
  
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.id, userId));
  
  res.json({ user });
});

// Admin: List all users
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        isActive: users.isActive,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);
    
    res.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Deactivate user
router.post("/admin/users/:id/deactivate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, userId));
    
    res.json({ message: "User deactivated" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// Admin: Activate user
router.post("/admin/users/:id/activate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    await db
      .update(users)
      .set({ isActive: true })
      .where(eq(users.id, userId));
    
    res.json({ message: "User activated" });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ error: "Failed to activate user" });
  }
});

export default router;
