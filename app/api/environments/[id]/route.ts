import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Environment from '@/models/Environment';
import { getAuthUser, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/environments/[id] - Get a single environment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const environment = await Environment.findById(id);

    if (!environment) {
      return notFoundResponse('Environment not found');
    }

    return NextResponse.json({ environment });
  } catch (error) {
    console.error('Error fetching environment:', error);
    return serverErrorResponse('Failed to fetch environment');
  }
}

// PUT /api/environments/[id] - Update an environment
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

    // If setting as default, unset other defaults first
    if (updates.isDefault) {
      const current = await Environment.findById(id);
      if (current) {
        await Environment.updateMany(
          { workspace: current.workspace, _id: { $ne: id } },
          { $set: { isDefault: false } }
        );
      }
    }

    const environment = await Environment.findOneAndUpdate(
      { _id: id, owner: user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!environment) {
      return notFoundResponse('Environment not found or unauthorized');
    }

    return NextResponse.json({ environment });
  } catch (error) {
    console.error('Error updating environment:', error);
    return serverErrorResponse('Failed to update environment');
  }
}

// DELETE /api/environments/[id] - Delete an environment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const environment = await Environment.findOneAndDelete({ _id: id, owner: user.id });

    if (!environment) {
      return notFoundResponse('Environment not found or unauthorized');
    }

    return NextResponse.json({ message: 'Environment deleted successfully' });
  } catch (error) {
    console.error('Error deleting environment:', error);
    return serverErrorResponse('Failed to delete environment');
  }
}
