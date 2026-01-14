import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Request from '@/models/Request';
import Collection from '@/models/Collection';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/requests - List requests (optionally filtered by collection)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const collectionId = request.nextUrl.searchParams.get('collectionId');
    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || user.activeWorkspace;

    if (!workspaceId) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const query: Record<string, unknown> = { workspace: workspaceId };
    if (collectionId) {
      query.collectionRef = collectionId;
    }

    const requests = await Request.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return serverErrorResponse('Failed to fetch requests');
  }
}

// POST /api/requests - Create a new request
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const data = await request.json();
    const { name, method, url, params, headers, body, bodyType, collectionId, workspaceId } = data;

    if (!name || !url) {
      return badRequestResponse('Name and URL are required');
    }

    const workspace = workspaceId || user.activeWorkspace;
    if (!workspace) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const newRequest = await Request.create({
      name,
      method: method || 'GET',
      url,
      params: params || [],
      headers: headers || [],
      body: body || '',
      bodyType: bodyType || 'json',
      collectionRef: collectionId || null,
      workspace,
      owner: user.id,
    });

    // If part of a collection, add to collection's requests array
    if (collectionId) {
      await Collection.findByIdAndUpdate(collectionId, {
        $push: { requests: newRequest._id },
      });
    }

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return serverErrorResponse('Failed to create request');
  }
}
