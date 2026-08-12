// app/connect-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebaseClient";
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, startAfter } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User, Globe, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface ConnectRequest {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  service: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const ITEMS_PER_PAGE = 9;

export default function ConnectRequestsPage() {
  const [requests, setRequests] = useState<ConnectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (direction?: 'next' | 'prev', lastDoc?: any, firstDoc?: any) => {
    setLoading(true);
    try {
      let q;
      const baseQuery = collection(db, "connectRequests");

      if (direction === 'next' && lastDoc) {
        q = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else if (direction === 'prev' && firstDoc) {
        // For previous page, we need to fetch in reverse order
        q = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          startAfter(firstDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ConnectRequest[];

      // Handle previous page - reverse the data
      let finalData = data;
      if (direction === 'prev' && firstDoc) {
        // Get the previous page by fetching backwards
        const prevQuery = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          startAfter(firstDoc),
          limit(ITEMS_PER_PAGE)
        );
        const prevSnapshot = await getDocs(prevQuery);
        finalData = prevSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConnectRequest[];
        
        if (finalData.length > 0) {
          setFirstVisible(prevSnapshot.docs[0]);
          setLastVisible(prevSnapshot.docs[prevSnapshot.docs.length - 1]);
        }
      } else {
        if (data.length > 0) {
          setFirstVisible(snapshot.docs[0]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }
      }

      setRequests(finalData);

      // Get total count for pagination
      const totalSnapshot = await getDocs(collection(db, "connectRequests"));
      const totalCount = totalSnapshot.size;
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages && lastVisible) {
      await fetchRequests('next', lastVisible);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      // For previous page, we need to get the document before the first visible
      // We'll use a different approach - fetch all and slice
      const allDocs = await getDocs(collection(db, "connectRequests"));
      const allData = allDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectRequest[];
      
      // Sort by createdAt desc (matching the order)
      allData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      
      const startIndex = (currentPage - 2) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageData = allData.slice(startIndex, endIndex);
      
      setRequests(pageData);
      setCurrentPage(currentPage - 1);
      
      // Update pagination markers
      if (allDocs.docs[startIndex]) {
        setFirstVisible(allDocs.docs[startIndex]);
      }
      if (allDocs.docs[Math.min(endIndex - 1, allDocs.docs.length - 1)]) {
        setLastVisible(allDocs.docs[Math.min(endIndex - 1, allDocs.docs.length - 1)]);
      }
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    await deleteDoc(doc(db, "connectRequests", id));

    // Refresh current page
    setRequests((prev) => prev.filter((r) => r.id !== id));
    
    // Update total pages
    const totalSnapshot = await getDocs(collection(db, "connectRequests"));
    const totalCount = totalSnapshot.size;
    setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading requests...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Connect Requests</h1>
          <span className="text-sm text-gray-500">
            Total: {requests.length} requests
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader className="pb-2 relative">
                <button
                  onClick={() => handleDelete(req.id)}
                  className="absolute top-2 right-2 p-1 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* No results message */}
        {requests.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No connect requests found</p>
          </div>
        )}
      </div>
    </>
  );
}