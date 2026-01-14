import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Collection from '@/models/Collection';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/collections - List all collections for the user's active workspace
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || user.activeWorkspace;
    if (!workspaceId) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const collections = await Collection.find({ workspace: workspaceId })
      .populate('requests', 'name method url')
      .sort({ updatedAt: -1 });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return serverErrorResponse('Failed to fetch collections');
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { name, description, workspaceId } = await request.json();

    if (!name) {
      return badRequestResponse('Collection name is required');
    }

    const workspace = workspaceId || user.activeWorkspace;
    if (!workspace) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const collection = await Collection.create({
      name,
      description,
      workspace,
      owner: user.id,
      requests: [],
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return serverErrorResponse('Failed to create collection');
  }
}
