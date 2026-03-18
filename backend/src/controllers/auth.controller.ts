import { Request, Response } from 'express';
import { db } from '../db/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional(),
});

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedData = registerSchema.parse(req.body);

    const existingUser = await db.select().from(users).where(eq(users.email, parsedData.email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await hashPassword(parsedData.password);

    const newUser = await db.insert(users).values({
      name: parsedData.name,
      email: parsedData.email,
      password: hashedPassword,
      role: parsedData.role || 'user',
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    const token = signToken({ id: newUser[0].id, role: newUser[0].role });

    res.status(201).json({ message: 'User registered successfully', user: newUser[0], token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userRecord = await db.select().from(users).where(eq(users.email, email));

    if (userRecord.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = userRecord[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, role: user.role });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
