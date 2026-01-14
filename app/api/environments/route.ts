import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Environment from '@/models/Environment';
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth-helpers';

// GET /api/environments - List all environments for the user's workspace
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || user.activeWorkspace;
    if (!workspaceId) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const environments = await Environment.find({ workspace: workspaceId })
      .sort({ isDefault: -1, name: 1 });

    return NextResponse.json({ environments });
  } catch (error) {
    console.error('Error fetching environments:', error);
    return serverErrorResponse('Failed to fetch environments');
  }
}

// POST /api/environments - Create a new environment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { name, variables, workspaceId } = await request.json();

    if (!name) {
      return badRequestResponse('Environment name is required');
    }

    const workspace = workspaceId || user.activeWorkspace;
    if (!workspace) {
      return badRequestResponse('No workspace specified');
    }

    await connectDB();

    const environment = await Environment.create({
      name,
      variables: variables || [],
      workspace,
      owner: user.id,
    });

    return NextResponse.json({ environment }, { status: 201 });
  } catch (error) {
    console.error('Error creating environment:', error);
    return serverErrorResponse('Failed to create environment');
  }
}
