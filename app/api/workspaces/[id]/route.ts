import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import Collection from '@/models/Collection';
import Request from '@/models/Request';
import Environment from '@/models/Environment';
import History from '@/models/History';
import { getAuthUser, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/workspaces/[id] - Get a single workspace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const workspace = await Workspace.findById(id)
      .populate('owner', 'name email image')
      .populate('members.user', 'name email image');

    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    // Check if user has access
    const hasAccess = workspace.owner._id.toString() === user.id ||
      workspace.members.some((m: { user: { _id: { toString: () => string } } }) => m.user._id.toString() === user.id);

    if (!hasAccess) {
      return unauthorizedResponse();
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return serverErrorResponse('Failed to fetch workspace');
  }
}

// PUT /api/workspaces/[id] - Update a workspace
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const updates = await request.json();

    await connectDB();

    // Only allow name and description updates
    const allowedUpdates = {
      name: updates.name,
      description: updates.description,
    };

    const workspace = await Workspace.findOneAndUpdate(
      { _id: id, owner: user.id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!workspace) {
      return notFoundResponse('Workspace not found or unauthorized');
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return serverErrorResponse('Failed to update workspace');
  }
}

// DELETE /api/workspaces/[id] - Delete a workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const workspace = await Workspace.findOne({ _id: id, owner: user.id });

    if (!workspace) {
      return notFoundResponse('Workspace not found or unauthorized');
    }

    if (workspace.isPersonal) {
      return badRequestResponse('Cannot delete personal workspace');
    }

    // Delete all related data
    await Promise.all([
      Request.deleteMany({ workspace: id }),
      Collection.deleteMany({ workspace: id }),
      Environment.deleteMany({ workspace: id }),
      History.deleteMany({ workspace: id }),
    ]);

    // Remove workspace from all users
    await User.updateMany(
      { workspaces: id },
      { $pull: { workspaces: id } }
    );

    // Update users who had this as active workspace
    await User.updateMany(
      { activeWorkspace: id },
      { $unset: { activeWorkspace: '' } }
    );

    await Workspace.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return serverErrorResponse('Failed to delete workspace');
  }
}
