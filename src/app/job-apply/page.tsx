"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Briefcase, FileText } from "lucide-react";

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  role: string;
  resumeUrl?: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function JobApplyPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "jobApplications"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobApplication[];

      setApplications(data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {applications.map((app) => (
        <Card
          key={app.id}
          className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <User className="w-4 h-4 text-blue-500" />
              {app.name}
            </CardTitle>

            {app.createdAt && (
              <span className="text-xs text-gray-400">
                {new Date(app.createdAt.seconds * 1000).toLocaleString()}
              </span>
            )}
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> {app.email}
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> {app.phone}
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" /> {app.role}
            </div>

            <p className="text-gray-700 text-sm bg-gray-50 border p-2 rounded-md border-gray-200">
              <strong>Experience:</strong> {app.experience}
            </p>

            {app.resumeUrl && (
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 underline font-medium"
              >
                <FileText className="w-4 h-4" /> View Resume
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
