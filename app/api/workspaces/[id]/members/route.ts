import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import { getAuthUser, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth-helpers';

// POST /api/workspaces/[id]/members - Add a member to workspace
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { email, role = 'member' } = await request.json();

    if (!email) {
      return badRequestResponse('Email is required');
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return badRequestResponse('Invalid role');
    }

    await connectDB();

    // Check if user is owner or admin of workspace
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    const userMember = workspace.members.find(
      (m: { user: { toString: () => string }; role: string }) =>
        m.user.toString() === user.id && ['owner', 'admin'].includes(m.role)
    );

    if (!userMember && workspace.owner.toString() !== user.id) {
      return unauthorizedResponse();
    }

    // Find the user to add
    const newMember = await User.findOne({ email: email.toLowerCase() });
    if (!newMember) {
      return notFoundResponse('User not found');
    }

    // Check if already a member
    const existingMember = workspace.members.find(
      (m: { user: { toString: () => string } }) => m.user.toString() === newMember._id.toString()
    );

    if (existingMember) {
      return badRequestResponse('User is already a member');
    }

    // Add member
    workspace.members.push({
      user: newMember._id,
      role,
      joinedAt: new Date(),
    });
    await workspace.save();

    // Add workspace to user's list
    await User.findByIdAndUpdate(newMember._id, {
      $addToSet: { workspaces: workspace._id },
    });

    const updatedWorkspace = await Workspace.findById(id)
      .populate('members.user', 'name email image');

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('Error adding member:', error);
    return serverErrorResponse('Failed to add member');
  }
}

// DELETE /api/workspaces/[id]/members - Remove a member from workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return badRequestResponse('User ID is required');
    }

    await connectDB();

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    // Check permissions - only owner/admin can remove others, anyone can remove themselves
    const isRemovingSelf = userId === user.id;
    const userMember = workspace.members.find(
      (m: { user: { toString: () => string }; role: string }) =>
        m.user.toString() === user.id && ['owner', 'admin'].includes(m.role)
    );

    if (!isRemovingSelf && !userMember && workspace.owner.toString() !== user.id) {
      return unauthorizedResponse();
    }

    // Cannot remove the owner
    if (workspace.owner.toString() === userId) {
      return badRequestResponse('Cannot remove workspace owner');
    }

    // Remove member
    workspace.members = workspace.members.filter(
      (m: { user: { toString: () => string } }) => m.user.toString() !== userId
    );
    await workspace.save();

    // Remove workspace from user's list
    await User.findByIdAndUpdate(userId, {
      $pull: { workspaces: workspace._id },
    });

    // If it was their active workspace, unset it
    await User.findOneAndUpdate(
      { _id: userId, activeWorkspace: workspace._id },
      { $unset: { activeWorkspace: '' } }
    );

    const updatedWorkspace = await Workspace.findById(id)
      .populate('members.user', 'name email image');

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('Error removing member:', error);
    return serverErrorResponse('Failed to remove member');
  }
}

// PATCH /api/workspaces/[id]/members - Update a member's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return badRequestResponse('User ID and role are required');
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return badRequestResponse('Invalid role');
    }

    await connectDB();

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return notFoundResponse('Workspace not found');
    }

    // Only owner can change roles
    if (workspace.owner.toString() !== user.id) {
      return unauthorizedResponse();
    }

    // Find and update member
    const memberIndex = workspace.members.findIndex(
      (m: { user: { toString: () => string } }) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return notFoundResponse('Member not found');
    }

    workspace.members[memberIndex].role = role;
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(id)
      .populate('members.user', 'name email image');

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('Error updating member role:', error);
    return serverErrorResponse('Failed to update member role');
  }
}
