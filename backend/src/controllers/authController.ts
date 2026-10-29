import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { uploadFile } from '../config/imagekit';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'college_super_secret_jwt_key_2026_genz_platform';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      phoneNumber,
      bio,
      // Student specific
      rollNumber,
      semester,
      batch,
      // Faculty specific
      employeeId,
      designation,
      specialization,
      officeRoom,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const validRoles: UserRole[] = ['STUDENT', 'FACULTY', 'ADMIN'];
    const chosenRole: UserRole = validRoles.includes(role) ? role : 'STUDENT';

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Check unique rollNumber for student if provided
    if (chosenRole === 'STUDENT' && rollNumber) {
      const rollExists = await User.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
      if (rollExists) {
        return res.status(400).json({ error: 'A student with this Roll Number is already registered' });
      }
    }

    // Check unique employeeId for faculty if provided
    if (chosenRole === 'FACULTY' && employeeId) {
      const empExists = await User.findOne({ employeeId: employeeId.trim().toUpperCase() });
      if (empExists) {
        return res.status(400).json({ error: 'A faculty member with this Employee ID is already registered' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: chosenRole,
      department: department || 'Computer Science & Engineering',
      phoneNumber,
      bio,
      avatar: '',
      // Student details
      rollNumber: rollNumber ? rollNumber.trim().toUpperCase() : undefined,
      semester: semester ? Number(semester) : undefined,
      batch: batch || '2023-2027',
      // Faculty details
      employeeId: employeeId ? employeeId.trim().toUpperCase() : undefined,
      designation: designation || (chosenRole === 'FACULTY' ? 'Assistant Professor' : undefined),
      specialization: specialization || (chosenRole === 'FACULTY' ? 'Computer Systems & Software' : undefined),
      officeRoom,
    });

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        role: newUser.role,
        email: newUser.email,
        name: newUser.name,
        department: newUser.department,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const sanitizedUser = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      message: 'Account registered successfully and stored in MongoDB!',
      user: sanitizedUser,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration: ' + error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found in MongoDB.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    if (expectedRole && user.role !== expectedRole && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `Role mismatch. Your account is registered as '${user.role}', but you selected the '${expectedRole}' portal.`,
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const sanitizedUser = await User.findById(user._id).select('-password');

    res.json({
      message: 'Login successful!',
      user: sanitizedUser,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found in MongoDB' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

/**
 * Update student or faculty profile details directly in MongoDB
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowedUpdates = [
      'name',
      'avatar',
      'department',
      'semester',
      'rollNumber',
      'batch',
      'employeeId',
      'designation',
      'specialization',
      'officeRoom',
      'phoneNumber',
      'bio',
    ];

    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select(
      '-password'
    );

    res.json({
      message: 'Profile details updated and saved to MongoDB!',
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
};

/**
 * Upload User Profile Picture / Avatar to ImageKit CDN or Local Storage
 */
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: 'Please upload a valid image format (JPG, PNG, JPEG, WEBP).',
      });
    }

    // Upload to ImageKit CDN (or local disk fallback)
    const uploadResult = await uploadFile(file.buffer, file.originalname, '/college_avatars');

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: uploadResult.fileUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture updated successfully!',
      avatar: uploadResult.fileUrl,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload profile picture: ' + error.message });
  }
};

/**
 * Seed initial demo accounts (Student, Faculty, Admin) with complete realistic profile details
 */
export const seedDemoAccounts = async (_req: Request, res: Response) => {
  try {
    const demoAccounts: Array<{
      name: string;
      email: string;
      password: string;
      role: UserRole;
      department: string;
      semester?: number;
      rollNumber?: string;
      batch?: string;
      employeeId?: string;
      designation?: string;
      specialization?: string;
      officeRoom?: string;
      phoneNumber?: string;
      bio?: string;
    }> = [
      {
        name: 'Alex Johnson',
        email: 'student@college.edu',
        password: 'password123',
        role: 'STUDENT',
        department: 'Computer Science & Engineering',
        semester: 6,
        rollNumber: '22CSE104',
        batch: '2023-2027',
        phoneNumber: '+91 98765 43210',
        bio: 'BTech CSE undergraduate enthusiastic about Information Retrieval, Operating Systems, and Distributed Systems.',
      },
      {
        name: 'Dr. Sarah Sharma',
        email: 'faculty@college.edu',
        password: 'password123',
        role: 'FACULTY',
        department: 'Computer Science & Engineering',
        employeeId: 'FAC-CSE-042',
        designation: 'Associate Professor',
        specialization: 'Database Management Systems & Distributed Architecture',
        officeRoom: 'Academic Block B, Room 304',
        phoneNumber: '+91 98111 22334',
        bio: 'Over 12 years of research and teaching experience in Relational DBs, Query Optimization, and High-Performance Storage.',
      },
      {
        name: 'System Administrator',
        email: 'admin@college.edu',
        password: 'password123',
        role: 'ADMIN',
        department: 'Central IT & Systems',
        employeeId: 'SYS-ADMIN-001',
        designation: 'Chief Systems Engineer',
        officeRoom: 'Server Center, Ground Floor',
        phoneNumber: '+91 98000 11223',
        bio: 'Oversees campus search infrastructure, MongoDB clusters, and inverted index maintenance pipelines.',
      },
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(acc.password, salt);
        await User.create({
          ...acc,
          password: hashedPassword,
          avatar: '',
        });
      } else {
        // Update with full fields if previously missing
        await User.updateOne({ email: acc.email }, { $set: acc });
      }
    }

    res.json({
      message: 'Demo accounts seeded with complete student and faculty details in MongoDB!',
      accounts: [
        { role: 'STUDENT', email: 'student@college.edu', password: 'password123', rollNo: '22CSE104' },
        { role: 'FACULTY', email: 'faculty@college.edu', password: 'password123', empId: 'FAC-CSE-042' },
        { role: 'ADMIN', email: 'admin@college.edu', password: 'password123', empId: 'SYS-ADMIN-001' },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to seed demo accounts: ' + error.message });
  }
};
