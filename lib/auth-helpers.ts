import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import connectDB from './db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  workspaces: string[];
  activeWorkspace?: string;
}

// Get authenticated user from session
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    workspaces: session.user.workspaces || [],
    activeWorkspace: session.user.activeWorkspace,
  };
}

// Helper to return unauthorized response
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// Helper to return bad request response
export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

// Helper to return not found response
export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

// Helper to return server error response
export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

// Helper to check if user has access to workspace
export async function checkWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return false;

  return user.workspaces.some(
    (w: { toString: () => string }) => w.toString() === workspaceId
  );
}
