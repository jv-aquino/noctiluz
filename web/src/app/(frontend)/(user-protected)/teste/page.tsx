import { auth } from "@/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function SessionTestPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const user = session?.user;
  const sessionData = session?.session;
  const role = session?.role;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p className="text-lg">
            Status: <span className={`font-bold ${user ? 'text-green-600' : 'text-red-600'}`}>
              {user ? 'Logged In' : 'Not Logged In'}
            </span>
          </p>
        </div>

        {user && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Image:</strong> {user.image || 'Not provided'}</p>
                <p><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}</p>
                <p><strong>Updated At:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Not available'}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Session Information</h2>
              <div className="space-y-2">
                <p><strong>Session ID:</strong> {sessionData?.id}</p>
                <p><strong>User ID:</strong> {sessionData?.userId}</p>
                <p><strong>Expires At:</strong> {sessionData?.expiresAt ? new Date(sessionData.expiresAt).toLocaleString() : 'Not available'}</p>
                <p><strong>IP Address:</strong> {sessionData?.ipAddress || 'Not available'}</p>
                <p><strong>User Agent:</strong> {sessionData?.userAgent || 'Not available'}</p>
              </div>
            </div>

            {role && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Role Information</h2>
                <p><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{role}</span></p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-4">
          <Link 
            href="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Home
          </Link>
          {user && (
            <Link 
              href="/logout" 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}