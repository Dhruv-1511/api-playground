import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Request from '@/models/Request';
import Collection from '@/models/Collection';
import { getAuthUser, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/requests/[id] - Get a single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const req = await Request.findById(id);

    if (!req) {
      return notFoundResponse('Request not found');
    }

    return NextResponse.json({ request: req });
  } catch (error) {
    console.error('Error fetching request:', error);
    return serverErrorResponse('Failed to fetch request');
  }
}

// PUT /api/requests/[id] - Update a request
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

    const req = await Request.findOneAndUpdate(
      { _id: id, owner: user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!req) {
      return notFoundResponse('Request not found or unauthorized');
    }

    return NextResponse.json({ request: req });
  } catch (error) {
    console.error('Error updating request:', error);
    return serverErrorResponse('Failed to update request');
  }
}

// DELETE /api/requests/[id] - Delete a request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const req = await Request.findOne({ _id: id, owner: user.id });

    if (!req) {
      return notFoundResponse('Request not found or unauthorized');
    }

    // Remove from collection if it belongs to one
    if (req.collectionRef) {
      await Collection.findByIdAndUpdate(req.collectionRef, {
        $pull: { requests: req._id },
      });
    }

    await Request.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    return serverErrorResponse('Failed to delete request');
  }
}
