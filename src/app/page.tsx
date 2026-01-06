// app/connect-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebaseClient"; 
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User, Globe } from "lucide-react";

interface ConnectRequest {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  service: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function ConnectRequestsPage() {
  const [requests, setRequests] = useState<ConnectRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "connectRequests"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ConnectRequest[];
      setRequests(data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {requests.map((req) => (
        <Card
          key={req.id}
          className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <User className="w-4 h-4 text-blue-500" />
              {req.name}
            </CardTitle>
            <span className="text-xs text-gray-400">
              {new Date(req.createdAt.seconds * 1000).toLocaleString()}
            </span>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> {req.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> {req.mobile}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> {req.service}
            </div>

            {req.message && (
              <p className="text-gray-700 mt-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                {req.message}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
