// import { NextResponse } from "next/server";
// import { authAdmin } from "@/lib/firebaseAdmin";

// export async function GET() {
//   try {
//     const listUsers = await authAdmin.listUsers(1000);
//     return NextResponse.json(listUsers.users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
//   }
// }





// app/api/users/route.js
import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // Fetch up to 1000 users (Firebase limit per request)
    const listUsersResult = await authAdmin.listUsers(1000);
    
    // Transform the data to include more user information
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        email: provider.email,
        displayName: provider.displayName,
        photoURL: provider.photoURL
      }))
    }));

    return NextResponse.json({
      success: true,
      users: users,
      totalUsers: users.length,
      hasMore: listUsersResult.pageToken ? true : false
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch users",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}