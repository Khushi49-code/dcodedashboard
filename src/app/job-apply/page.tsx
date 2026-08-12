"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebaseClient";
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, startAfter } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Briefcase, FileText, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  role: string;
  resumeUrl?: string;
  resumeBase64?: string;
  resumeName?: string;
  resumeType?: string;
  resumeSize?: number;
  createdAt: { seconds: number; nanoseconds: number };
}

const ITEMS_PER_PAGE = 9;

const JobApplyPage = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (direction?: 'next' | 'prev', lastDoc?: any, firstDoc?: any) => {
    setLoading(true);
    try {
      let q;
      const baseQuery = collection(db, "jobApplications");

      if (direction === 'next' && lastDoc) {
        q = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else if (direction === 'prev' && firstDoc) {
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
      })) as JobApplication[];

      let finalData = data;
      if (direction === 'prev' && firstDoc) {
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
        })) as JobApplication[];
        
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

      setApplications(finalData);

      // Get total count for pagination (only once)
      if (totalCount === 0) {
        const totalSnapshot = await getDocs(collection(db, "jobApplications"));
        const count = totalSnapshot.size;
        setTotalCount(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages && lastVisible) {
      await fetchApplications('next', lastVisible);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      // For previous page, fetch all and slice
      const allDocs = await getDocs(collection(db, "jobApplications"));
      const allData = allDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobApplication[];
      
      // Sort by createdAt desc
      allData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      
      const startIndex = (currentPage - 2) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageData = allData.slice(startIndex, endIndex);
      
      setApplications(pageData);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "jobApplications", id));
      
      // Update state to remove the deleted application
      setApplications(applications.filter(app => app.id !== id));
      setTotalCount(prev => prev - 1);
      
      // Update total pages
      const newTotalPages = Math.ceil((totalCount - 1) / ITEMS_PER_PAGE);
      setTotalPages(newTotalPages);
      
      // If current page has no items and it's not the first page, go to previous page
      if (applications.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        await fetchApplications();
      }
      
      console.log("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadBase64Resume = (app: JobApplication) => {
    if (!app.resumeBase64) {
      alert("No resume available for download");
      return;
    }

    let base64Data = app.resumeBase64;
    
    if (!base64Data.startsWith('data:')) {
      base64Data = `data:${app.resumeType || 'application/pdf'};base64,${base64Data}`;
    }

    const link = document.createElement('a');
    link.href = base64Data;
    link.download = app.resumeName || `${app.name}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewResumeInNewTab = (app: JobApplication) => {
    if (!app.resumeBase64) {
      alert("No resume available to view");
      return;
    }

    let base64Data = app.resumeBase64;
    
    if (!base64Data.startsWith('data:')) {
      base64Data = `data:${app.resumeType || 'application/pdf'};base64,${base64Data}`;
    }

    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>${app.resumeName || app.name + "'s Resume"}</title>
            <style>
              body { margin: 0; padding: 0; }
              embed { 
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100vw; 
                height: 100vh; 
                border: none;
              }
            </style>
          </head>
          <body>
            <embed 
              src="${base64Data}" 
              type="${app.resumeType || 'application/pdf'}" 
              width="100%" 
              height="100%"
            />
          </body>
        </html>
      `);
      newTab.document.close();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <div className="text-sm text-gray-500">
          Total: {totalCount} applications
        </div>
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No applications yet</h3>
          <p className="text-gray-500">Job applications will appear here once submitted.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative"
              >
                <button
                  onClick={() => handleDelete(app.id)}
                  disabled={deletingId === app.id}
                  className="absolute top-3 right-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Application"
                >
                  {deletingId === app.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

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
                    <Mail className="w-4 h-4 text-gray-400" /> 
                    <span className="truncate">{app.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> 
                    {app.phone}
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" /> 
                    <span className="truncate">{app.role}</span>
                  </div>

                  <p className="text-gray-700 text-sm bg-gray-50 border p-2 rounded-md border-gray-200">
                    <strong>Experience:</strong> {app.experience}
                  </p>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Resume:</p>
                    
                    <div className="flex flex-col gap-2">
                      {app.resumeBase64 ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewResumeInNewTab(app)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                          >
                            <FileText className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => downloadBase64Resume(app)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        </div>
                      ) : app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 py-2 px-3 rounded-md text-sm"
                        >
                          <FileText className="w-4 h-4" /> View Resume (URL)
                        </a>
                      ) : (
                        <p className="text-red-500 text-sm">No resume uploaded</p>
                      )}
                      
                      {app.resumeName && (
                        <p className="text-xs text-gray-500 truncate">
                          📄 {app.resumeName} 
                          {app.resumeSize && ` (${(app.resumeSize / 1024).toFixed(1)} KB)`}
                        </p>
                      )}
                    </div>
                  </div>
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

          {/* Page Info */}
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {applications.length} of {totalCount} applications
          </div>
        </>
      )}
    </div>
  );
};

export default JobApplyPage;