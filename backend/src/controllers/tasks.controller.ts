import { Response } from 'express';
import { db } from '../db/db';
import { tasks, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const taskIdSchema = z.coerce.number().int().positive();

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional().nullable(),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    isCompleted: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required',
  });

export const createTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, description } = createTaskSchema.parse(req.body);
    const userId = req.user!.id;
    const normalizedDescription = description && description.length > 0 ? description : null;
    const newTask = await db.insert(tasks).values({ title, description: normalizedDescription, userId }).returning();
    res.status(201).json(newTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.issues });
    }
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let userTasks;
    if (role === 'admin') {
      userTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        isCompleted: tasks.isCompleted,
        createdAt: tasks.createdAt,
        userId: tasks.userId,
        user: { name: users.name }
      }).from(tasks).leftJoin(users, eq(tasks.userId, users.id));
    } else {
      userTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        isCompleted: tasks.isCompleted,
        createdAt: tasks.createdAt,
        userId: tasks.userId,
      }).from(tasks).where(eq(tasks.userId, userId));
    }
    res.status(200).json(userTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const taskId = taskIdSchema.parse(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const taskRecord = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (taskRecord.length === 0) return res.status(404).json({ message: 'Task not found' });

    const task = taskRecord[0];

    if (role !== 'admin' && task.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.issues });
    }
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const taskId = taskIdSchema.parse(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;
    const { title, description, isCompleted } = updateTaskSchema.parse(req.body);

    const taskRecord = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (taskRecord.length === 0) return res.status(404).json({ message: 'Task not found' });

    if (role !== 'admin' && taskRecord[0].userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatePayload: {
      title?: string;
      description?: string | null;
      isCompleted?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (title !== undefined) {
      updatePayload.title = title;
    }

    if (description !== undefined) {
      updatePayload.description = description && description.length > 0 ? description : null;
    }

    if (isCompleted !== undefined) {
      updatePayload.isCompleted = isCompleted;
    }

    const updatedTask = await db.update(tasks)
      .set(updatePayload)
      .where(eq(tasks.id, taskId))
      .returning();

    res.status(200).json(updatedTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.issues });
    }
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const taskId = taskIdSchema.parse(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const taskRecord = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (taskRecord.length === 0) return res.status(404).json({ message: 'Task not found' });

    if (role !== 'admin' && taskRecord[0].userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.issues });
    }
    res.status(500).json({ message: 'Error deleting task' });
  }
};
