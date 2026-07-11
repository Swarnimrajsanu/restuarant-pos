import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT (supports email or workerId)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide Email/Worker ID and password' });
      return;
    }

    // Find user by email or workerId and include password
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { workerId: email.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token and respond
    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workerId: user.workerId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * POST /api/auth/register
 * Register a new worker (owner only, supports email and/or workerId)
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, workerId, password, role } = req.body;

    if (!name || !password) {
      res.status(400).json({ message: 'Please provide name and password' });
      return;
    }

    if (!email && !workerId) {
      res.status(400).json({ message: 'Please provide email or worker ID' });
      return;
    }

    // Check if workerId already exists
    if (workerId) {
      const existingWorker = await User.findOne({ workerId: workerId.toLowerCase() });
      if (existingWorker) {
        res.status(400).json({ message: 'Worker with this Worker ID already exists' });
        return;
      }
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email || undefined,
      workerId: workerId || undefined,
      password,
      role: role || 'worker',
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workerId: user.workerId,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Worker ID or Email already exists' });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * PUT /api/auth/workers/:id
 * Update worker details (owner only)
 */
export const updateWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, workerId, password } = req.body;
    const worker = await User.findById(req.params.id);

    if (!worker || worker.role !== 'worker') {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }

    if (name) worker.name = name;

    if (email !== undefined) {
      if (email && email.toLowerCase() !== worker.email?.toLowerCase()) {
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
          res.status(400).json({ message: 'User with this email already exists' });
          return;
        }
      }
      worker.email = email || undefined;
    }

    if (workerId !== undefined) {
      if (workerId && workerId.toLowerCase() !== worker.workerId?.toLowerCase()) {
        const existingWorker = await User.findOne({ workerId: workerId.toLowerCase() });
        if (existingWorker) {
          res.status(400).json({ message: 'Worker with this Worker ID already exists' });
          return;
        }
      }
      worker.workerId = workerId || undefined;
    }

    if (password) {
      worker.password = password; // pre-save hook will hash
    }

    await worker.save();

    res.json({
      user: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        workerId: worker.workerId,
        role: worker.role,
      },
    });
  } catch (error) {
    console.error('UpdateWorker error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
};

/**
 * DELETE /api/auth/workers/:id
 * Delete a worker (owner only)
 */
export const deleteWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const worker = await User.findOneAndDelete({ _id: req.params.id, role: 'worker' });
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('DeleteWorker error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        workerId: req.user.workerId,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/auth/workers
 * Get all workers (owner only)
 */
export const getWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort({ name: 1 });
    res.json(workers);
  } catch (error) {
    console.error('GetWorkers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/auth/public/workers
 * Get public list of workers (no auth required)
 */
export const getPublicWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = await User.find({ role: 'worker' }).select('_id name').sort({ name: 1 });
    res.json(workers);
  } catch (error) {
    console.error('GetPublicWorkers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/auth/worker-login
 * Authenticate worker via selected name/id and workerId PIN (no password required)
 */
export const workerLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, workerId } = req.body;

    if (!userId || !workerId) {
      res.status(400).json({ message: 'Please select your name and enter your Worker ID' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'worker') {
      res.status(401).json({ message: 'Worker not found' });
      return;
    }

    // Check case-insensitive match
    if (!user.workerId || user.workerId.toLowerCase() !== workerId.trim().toLowerCase()) {
      res.status(401).json({ message: 'Incorrect Worker ID' });
      return;
    }

    // Generate token and respond
    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workerId: user.workerId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('WorkerLogin error:', error);
    res.status(500).json({ message: 'Server error during worker login' });
  }
};

/**
 * PUT /api/auth/profile
 * Update the currently logged-in owner's own credentials (name, email, password)
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // Fetch user with password for verification
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If changing email or password, current password is required
    const isChangingSecure = email !== undefined || newPassword;
    if (isChangingSecure) {
      if (!currentPassword) {
        res.status(400).json({ message: 'Current password is required to change email or password' });
        return;
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }
    }

    // Update name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update email
    if (email !== undefined && email.trim()) {
      const emailLower = email.trim().toLowerCase();
      if (emailLower !== user.email?.toLowerCase()) {
        const existingEmail = await User.findOne({ email: emailLower, _id: { $ne: user._id } });
        if (existingEmail) {
          res.status(400).json({ message: 'This email is already in use by another account' });
          return;
        }
      }
      user.email = emailLower;
    }

    // Update password
    if (newPassword) {
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters' });
        return;
      }
      user.password = newPassword; // pre-save hook will hash
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
