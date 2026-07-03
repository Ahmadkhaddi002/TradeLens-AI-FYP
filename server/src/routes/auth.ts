import { Router } from 'express';
import { registerOnLeaderboard } from '../services/leaderboard.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  experience: string;
  timezone: string;
}

interface User extends UserProfile {
  password: string;
  createdAt: string;
  mt5Connected: boolean;
  googleConnected: boolean;
}

const users: User[] = [];

function validateSignup(name: string, email: string, password: string): string | null {
  if (!name || typeof name !== 'string') return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!email || typeof email !== 'string') return 'Email is required';
  if (!EMAIL_RE.test(email.trim())) return 'Invalid email format';
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  const ruleCount = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length + (password.length >= 8 ? 1 : 0);
  if (ruleCount < 3) return 'Password must meet at least 3 of 4 strength rules';
  return null;
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const validationError = validateSignup(name, email, password);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }
  const exists = users.find((u) => u.email === email.trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists' });
  }
  const user: User = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    avatar: name.trim().slice(0, 2).toUpperCase(),
    bio: '',
    experience: 'Intermediate',
    timezone: 'UTC-5 (Eastern Time)',
    createdAt: new Date().toISOString(),
    mt5Connected: false,
    googleConnected: false,
  };
  users.push(user);
  registerOnLeaderboard({ name: user.name, email: user.email, avatar: user.avatar });
  console.log(`User registered: ${user.email}`);
  res.status(201).json({ success: true, user: { name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, experience: user.experience, timezone: user.timezone, mt5Connected: user.mt5Connected } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  if (!password || password.length < 1) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }
  const user = users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
  registerOnLeaderboard({ name: user.name, email: user.email, avatar: user.avatar });
  res.json({ success: true, user: { name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, experience: user.experience, timezone: user.timezone, mt5Connected: user.mt5Connected } });
});

router.post('/google', (req, res) => {
  const { email, name } = req.body;
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required for Google authentication' });
  }
  const cleanEmail = email.trim().toLowerCase();
  let user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    const displayName = (name || cleanEmail.split('@')[0]).trim();
    if (displayName.length < 1) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    user = {
      name: displayName,
      email: cleanEmail,
      password: '',
      avatar: displayName.slice(0, 2).toUpperCase(),
      bio: '',
      experience: 'Intermediate',
      timezone: 'UTC-5 (Eastern Time)',
      createdAt: new Date().toISOString(),
      mt5Connected: false,
      googleConnected: true,
    };
    users.push(user);
    registerOnLeaderboard({ name: user.name, email: user.email, avatar: user.avatar });
    console.log(`User registered via Google: ${cleanEmail}`);
  }
  registerOnLeaderboard({ name: user.name, email: user.email, avatar: user.avatar });
  res.json({ success: true, user: { name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, experience: user.experience, timezone: user.timezone, mt5Connected: user.mt5Connected } });
});

router.put('/profile', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  const cleanName = req.body.name !== undefined ? String(req.body.name).trim() : undefined;
  if (cleanName !== undefined) {
    if (cleanName.length < 2) return res.status(400).json({ success: false, error: 'Name must be at least 2 characters' });
    user.name = cleanName;
  }
  if (req.body.avatar !== undefined) {
    const av = String(req.body.avatar).trim();
    if (av.length < 1) return res.status(400).json({ success: false, error: 'Avatar is required' });
    if (av.length > 500000) return res.status(400).json({ success: false, error: 'Avatar too large' });
    user.avatar = av;
  }
  if (req.body.bio !== undefined) {
    const bio = String(req.body.bio).trim();
    if (bio.length > 500) return res.status(400).json({ success: false, error: 'Bio must be under 500 characters' });
    user.bio = bio;
  }
  if (req.body.experience !== undefined) {
    const valid = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
    if (!valid.includes(req.body.experience)) return res.status(400).json({ success: false, error: 'Invalid experience level' });
    user.experience = req.body.experience;
  }
  if (req.body.timezone !== undefined) user.timezone = req.body.timezone;
  if (req.body.mt5Connected !== undefined) user.mt5Connected = Boolean(req.body.mt5Connected);
  registerOnLeaderboard({ name: user.name, email: user.email, avatar: user.avatar });
  console.log(`Profile updated: ${email}`);
  res.json({
    success: true,
    user: { name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, experience: user.experience, timezone: user.timezone, mt5Connected: user.mt5Connected },
  });
});

router.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  if (user.password && user.password !== currentPassword) {
    return res.status(403).json({ success: false, error: 'Current password is incorrect' });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
  }
  user.password = newPassword;
  user.googleConnected = false;
  res.json({ success: true });
});

router.post('/change-email', (req, res) => {
  const { email, newEmail, password } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  if (user.password && user.password !== password) {
    return res.status(403).json({ success: false, error: 'Password is incorrect' });
  }
  if (!newEmail || !EMAIL_RE.test(newEmail)) {
    return res.status(400).json({ success: false, error: 'Valid new email is required' });
  }
  const exists = users.find((u) => u.email === newEmail.trim().toLowerCase());
  if (exists) return res.status(409).json({ success: false, error: 'Email already in use' });
  user.email = newEmail.trim().toLowerCase();
  res.json({ success: true, user: { name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, experience: user.experience, timezone: user.timezone, mt5Connected: user.mt5Connected, googleConnected: user.googleConnected } });
});

router.post('/disconnect-google', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  if (!user.googleConnected) return res.status(400).json({ success: false, error: 'Google is not connected' });
  user.googleConnected = false;
  res.json({ success: true });
});

router.delete('/account', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  const idx = users.findIndex((u) => u.email === email.trim().toLowerCase());
  if (idx === -1) return res.status(404).json({ success: false, error: 'User not found' });
  const user = users[idx];
  if (user.password && user.password !== password) {
    return res.status(403).json({ success: false, error: 'Password is incorrect' });
  }
  users.splice(idx, 1);
  res.json({ success: true });
});

router.get('/users', (_req, res) => {
  const connectedUsers = users
    .filter((u) => u.mt5Connected)
    .map((u) => ({ name: u.name, email: u.email, avatar: u.avatar }));
  res.json(connectedUsers);
});

export default router;
