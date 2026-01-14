import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import Environment from '@/models/Environment';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/workspaces - List all workspaces for the user
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    await connectDB();

    const workspaces = await Workspace.find({
      $or: [
        { owner: user.id },
        { 'members.user': user.id },
      ],
    })
      .populate('owner', 'name email image')
      .populate('members.user', 'name email image')
      .sort({ isPersonal: -1, name: 1 });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return serverErrorResponse('Failed to fetch workspaces');
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { name, description } = await request.json();

    if (!name) {
      return badRequestResponse('Workspace name is required');
    }

    await connectDB();

    // Create the workspace
    const workspace = await Workspace.create({
      name,
      description,
      owner: user.id,
      members: [{
        user: user.id,
        role: 'owner',
        joinedAt: new Date(),
      }],
      isPersonal: false,
    });

    // Add workspace to user's workspaces list
    await User.findByIdAndUpdate(user.id, {
      $push: { workspaces: workspace._id },
    });

    // Create default environments for the new workspace
    await Environment.insertMany([
      {
        name: 'Development',
        workspace: workspace._id,
        owner: user.id,
        isDefault: true,
        variables: [
          { key: 'BASE_URL', value: 'http://localhost:3000', isSecret: false },
        ],
      },
      {
        name: 'Production',
        workspace: workspace._id,
        owner: user.id,
        isDefault: false,
        variables: [
          { key: 'BASE_URL', value: 'https://api.example.com', isSecret: false },
        ],
      },
    ]);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return serverErrorResponse('Failed to create workspace');
  }
}
