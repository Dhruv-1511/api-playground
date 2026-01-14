import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      workspaces: string[];
      activeWorkspace?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    workspaces?: string[];
    activeWorkspace?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    workspaces: string[];
    activeWorkspace?: string;
  }
}
