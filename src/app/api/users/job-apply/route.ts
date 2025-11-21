import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Allow CORS
export const OPTIONS = async () => {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const mobile = formData.get("mobile") as string;
    const position = formData.get("position") as string;
    const resumeFile = formData.get("resume") as File | null;

    let resumeUrl = "";

    // Upload resume file (optional)
    if (resumeFile) {
      const fileRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`);
      await uploadBytes(fileRef, await resumeFile.arrayBuffer());
      resumeUrl = await getDownloadURL(fileRef);
    }

    // Save form data to Firestore
    await addDoc(collection(db, "jobApplications"), {
      name,
      email,
      mobile,
      position,
      resumeUrl,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
