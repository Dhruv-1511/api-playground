import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import Environment from '@/models/Environment';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      provider: 'credentials',
    });

    // Create a personal workspace for the new user
    const workspace = await Workspace.create({
      name: 'Personal Workspace',
      owner: user._id,
      isPersonal: true,
      members: [{
        user: user._id,
        role: 'owner',
        joinedAt: new Date(),
      }],
    });

    // Create default environments for the workspace
    await Environment.insertMany([
      {
        name: 'Development',
        workspace: workspace._id,
        owner: user._id,
        isDefault: true,
        variables: [
          { key: 'BASE_URL', value: 'http://localhost:3000', isSecret: false },
          { key: 'API_KEY', value: '', isSecret: true },
        ],
      },
      {
        name: 'Production',
        workspace: workspace._id,
        owner: user._id,
        isDefault: false,
        variables: [
          { key: 'BASE_URL', value: 'https://api.example.com', isSecret: false },
          { key: 'API_KEY', value: '', isSecret: true },
        ],
      },
    ]);

    // Update user with workspace
    user.workspaces = [workspace._id];
    user.activeWorkspace = workspace._id;
    await user.save();

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
