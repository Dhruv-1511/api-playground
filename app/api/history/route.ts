import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import History from '@/models/History';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/history - List request history for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || user.activeWorkspace;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);

    if (!workspaceId) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      History.find({ workspace: workspaceId, owner: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      History.countDocuments({ workspace: workspaceId, owner: user.id }),
    ]);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return serverErrorResponse('Failed to fetch history');
  }
}

// POST /api/history - Add a request to history
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { method, url, params, headers, body, response, workspaceId } = await request.json();

    if (!url || !response) {
      return badRequestResponse('URL and response are required');
    }

    const workspace = workspaceId || user.activeWorkspace;
    if (!workspace) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    // Limit history to 100 entries per user per workspace
    const historyCount = await History.countDocuments({
      workspace,
      owner: user.id,
    });

    if (historyCount >= 100) {
      // Delete oldest entries to make room
      const oldestEntries = await History.find({ workspace, owner: user.id })
        .sort({ createdAt: 1 })
        .limit(historyCount - 99)
        .select('_id');

      await History.deleteMany({
        _id: { $in: oldestEntries.map(e => e._id) },
      });
    }

    const historyEntry = await History.create({
      method,
      url,
      params: params || [],
      headers: headers || [],
      body,
      response,
      workspace,
      owner: user.id,
    });

    return NextResponse.json({ history: historyEntry }, { status: 201 });
  } catch (error) {
    console.error('Error adding to history:', error);
    return serverErrorResponse('Failed to add to history');
  }
}

// DELETE /api/history - Clear all history
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || user.activeWorkspace;

    if (!workspaceId) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    await History.deleteMany({ workspace: workspaceId, owner: user.id });

    return NextResponse.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Error clearing history:', error);
    return serverErrorResponse('Failed to clear history');
  }
}
