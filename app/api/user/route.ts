import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    await connectDB();

    const userData = await User.findById(user.id)
      .populate('workspaces', 'name isPersonal')
      .select('-password');

    if (!userData) {
      return unauthorizedResponse();
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    return serverErrorResponse('Failed to fetch user');
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const updates = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates: Record<string, unknown> = {};
    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.image) allowedUpdates.image = updates.image;
    if (updates.activeWorkspace) allowedUpdates.activeWorkspace = updates.activeWorkspace;

    if (Object.keys(allowedUpdates).length === 0) {
      return badRequestResponse('No valid fields to update');
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )
      .populate('workspaces', 'name isPersonal')
      .select('-password');

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return serverErrorResponse('Failed to update user');
  }
}
