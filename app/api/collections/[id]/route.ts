import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';
import Request from '@/models/Request';
import { getAuthUser, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth-helpers';
import { randomBytes } from 'crypto';

// GET /api/collections/[id] - Get a single collection with its requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const collection = await Collection.findById(id)
      .populate('requests');

    if (!collection) {
      return notFoundResponse('Collection not found');
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return serverErrorResponse('Failed to fetch collection');
  }
}

// PUT /api/collections/[id] - Update a collection
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

    const collection = await Collection.findOneAndUpdate(
      { _id: id, owner: user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!collection) {
      return notFoundResponse('Collection not found or unauthorized');
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return serverErrorResponse('Failed to update collection');
  }
}

// DELETE /api/collections/[id] - Delete a collection and its requests
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await connectDB();

    const collection = await Collection.findOne({ _id: id, owner: user.id });

    if (!collection) {
      return notFoundResponse('Collection not found or unauthorized');
    }

    // Delete all requests in this collection
    await Request.deleteMany({ collection: id });

    // Delete the collection
    await Collection.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return serverErrorResponse('Failed to delete collection');
  }
}

// PATCH /api/collections/[id] - Special operations (share/unshare)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { action } = await request.json();

    await connectDB();

    const collection = await Collection.findOne({ _id: id, owner: user.id });

    if (!collection) {
      return notFoundResponse('Collection not found or unauthorized');
    }

    if (action === 'share') {
      // Generate a unique share token
      collection.isShared = true;
      collection.shareToken = randomBytes(16).toString('hex');
      await collection.save();

      return NextResponse.json({
        collection,
        shareUrl: `/shared/${collection.shareToken}`,
      });
    } else if (action === 'unshare') {
      collection.isShared = false;
      collection.shareToken = undefined;
      await collection.save();

      return NextResponse.json({ collection });
    }

    return badRequestResponse('Invalid action');
  } catch (error) {
    console.error('Error updating collection:', error);
    return serverErrorResponse('Failed to update collection');
  }
}
