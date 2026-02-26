//"use client";
// import { useState, useEffect } from "react";
// import db from "@/lib/firebaseClient";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
//   serverTimestamp,
// } from "firebase/firestore";

// // Available tags for selection
// const AVAILABLE_TAGS = ["Tech", "SaaS", "Fashion", "Lifestyle", "Business", "Health", "Travel", "Food"];

// export default function BlogsPage() {
//   const [blogs, setBlogs] = useState([]);
//   const [filteredBlogs, setFilteredBlogs] = useState([]);
//   const [selectedTag, setSelectedTag] = useState("All");
//   const [form, setForm] = useState({
//     title: "",
//     content: "",
//     links: [{ name: "", url: "" }],
//     imageUrl: "",
//     tags: [],
//   });

//   // Fetch blogs
//   const fetchBlogs = async () => {
//     const querySnapshot = await getDocs(collection(db, "blogs"));
//     const data = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     setBlogs(data);
//     setFilteredBlogs(data);
//   };

//   useEffect(() => {
//     fetchBlogs();
//   }, []);

//   // Filter blogs by tag
//   useEffect(() => {
//     if (selectedTag === "All") {
//       setFilteredBlogs(blogs);
//     } else {
//       const filtered = blogs.filter(blog =>
//         blog.tags && blog.tags.includes(selectedTag)
//       );
//       setFilteredBlogs(filtered);
//     }
//   }, [selectedTag, blogs]);

//   // Handle form change
//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleLinkChange = (index, field, value) => {
//     const newLinks = [...form.links];
//     newLinks[index][field] = value;
//     setForm((prev) => ({ ...prev, links: newLinks }));
//   };

//   const addLinkField = () => {
//     setForm((prev) => ({ ...prev, links: [...prev.links, { name: "", url: "" }] }));
//   };

//   // Handle tag selection
//   const handleTagToggle = (tag) => {
//     setForm((prev) => {
//       const currentTags = prev.tags || [];
//       if (currentTags.includes(tag)) {
//         return { ...prev, tags: currentTags.filter(t => t !== tag) };
//       } else {
//         return { ...prev, tags: [...currentTags, tag] };
//       }
//     });
//   };

//   // Add blog
//   const addBlog = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.content) return;

//     await addDoc(collection(db, "blogs"), {
//       ...form,
//       createdAt: serverTimestamp(),
//     });

//     setForm({
//       title: "",
//       content: "",
//       links: [{ name: "", url: "" }],
//       imageUrl: "",
//       tags: []
//     });
//     fetchBlogs();
//   };

//   // Delete blog
//   const deleteBlog = async (id) => {
//     await deleteDoc(doc(db, "blogs", id));
//     fetchBlogs();
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>

//       {/* Blog Filter */}
//       <div className="mb-8 p-4 bg-gray-50 rounded-lg">
//         <h2 className="text-lg font-semibold mb-3">Filter by Tag</h2>
//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => setSelectedTag("All")}
//             className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === "All"
//               ? "bg-black text-white"
//               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
//               }`}
//           >
//             All
//           </button>
//           {AVAILABLE_TAGS.map((tag) => (
//             <button
//               key={tag}
//               onClick={() => setSelectedTag(tag)}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === tag
//                 ? "bg-black text-white"
//                 : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
//                 }`}
//             >
//               {tag}
//             </button>
//           ))}
//         </div>
//         <p className="text-sm text-gray-600 mt-2">
//           Showing {filteredBlogs.length} of {blogs.length} blogs
//         </p>
//       </div>

//       {/* Add Blog Form */}
//       <form onSubmit={addBlog} className="space-y-4 mb-8 p-6 border rounded-lg bg-white">
//         <h2 className="text-xl font-semibold mb-4">Add New Blog</h2>

//         <input
//           type="text"
//           placeholder="Blog Title"
//           value={form.title}
//           onChange={(e) => handleChange("title", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
//           required
//         />

//         <textarea
//           placeholder="Blog Content"
//           value={form.content}
//           onChange={(e) => handleChange("content", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent min-h-[120px]"
//           required
//         />

//         {/* Tags Selection */}
//         <div className="space-y-3">
//           <h3 className="font-semibold">Select Tags</h3>
//           <div className="flex flex-wrap gap-2">
//             {AVAILABLE_TAGS.map((tag) => (
//               <button
//                 type="button"
//                 key={tag}
//                 onClick={() => handleTagToggle(tag)}
//                 className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.tags?.includes(tag)
//                   ? "bg-black text-white border-black"
//                   : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                   }`}
//               >
//                 {tag}
//               </button>
//             ))}
//           </div>
//           {form.tags && form.tags.length > 0 && (
//             <p className="text-sm text-gray-600">
//               Selected: {form.tags.join(", ")}
//             </p>
//           )}
//         </div>

//         {/* Links Section */}
//         <div className="space-y-3">
//           <h3 className="font-semibold">Links</h3>
//           {form.links.map((link, index) => (
//             <div key={index} className="flex gap-3">
//               <input
//                 type="text"
//                 placeholder="Link Name"
//                 value={link.name}
//                 onChange={(e) => handleLinkChange(index, "name", e.target.value)}
//                 className="w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
//               />
//               <input
//                 type="url"
//                 placeholder="Link URL"
//                 value={link.url}
//                 onChange={(e) => handleLinkChange(index, "url", e.target.value)}
//                 className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
//               />
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addLinkField}
//             className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             + Add Link
//           </button>
//         </div>

//         {/* Image URL input */}
//         <div className="space-y-2">
//           <input
//             type="url"
//             placeholder="Image URL"
//             value={form.imageUrl}
//             onChange={(e) => handleChange("imageUrl", e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
//           />
//           {form.imageUrl && (
//             <div>
//               <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
//               <img
//                 src={form.imageUrl}
//                 alt="preview"
//                 className="w-48 h-32 object-cover rounded-lg border"
//               />
//             </div>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
//         >
//           Add Blog
//         </button>
//       </form>

//       {/* Blogs List */}
//       <div className="space-y-6">
//         <h2 className="text-2xl font-semibold mb-4">
//           {selectedTag === "All" ? "All Blogs" : `${selectedTag} Blogs`}
//         </h2>

//         {filteredBlogs.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No blogs found{selectedTag !== "All" ? ` for tag "${selectedTag}"` : ""}.
//           </div>
//         ) : (
//           filteredBlogs.map((blog) => (
//             <div
//               key={blog.id}
//               className="border border-gray-200 rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
//             >
//               {blog.imageUrl && (
//                 <img
//                   src={blog.imageUrl}
//                   alt={blog.title}
//                   className="w-full h-64 object-cover rounded-lg"
//                 />
//               )}

//               <div>
//                 <h2 className="font-semibold text-xl mb-2">{blog.title}</h2>
//                 <p className="text-gray-700 leading-relaxed">{blog.content}</p>
//               </div>

//               {/* Blog Tags */}
//               {blog.tags && blog.tags.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                   {blog.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               {blog.links?.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-2">Related Links:</h4>
//                   <ul className="space-y-1">
//                     {blog.links.map((link, i) => (
//                       <li key={i}>
//                         <a
//                           href={link.url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 hover:underline text-sm"
//                         >
//                           {link.name || link.url}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               <div className="flex gap-4">
//                 <button
//                   onClick={() => console.log("Edit blog:", blog.id)}
//                   className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
//                 >
//                   Edit Blog
//                 </button>

//                 <button
//                   onClick={() => deleteBlog(blog.id)}
//                   className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
//                 >
//                   Delete Blog
//                 </button>
//               </div>
{/* <button
                onClick={() => deleteBlog(blog.id)}
                className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
              >
                Delete Blog
              </button> */}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
























"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import db from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// Define proper types
interface Blog {
  id: string;
  title: string;
  content: string;
  links?: Array<{ name: string; url: string }>;
  imageUrl?: string;
  tags?: string[];
  createdAt?: any;
}

interface BlogFormData {
  title: string;
  content: string;
  links: Array<{ name: string; url: string }>;
  imageUrl: string;
  tags: string[];
}

export default function BlogsPage() {
  const AVAILABLE_TAGS = [
    "Tech",
    "SaaS",
    "Fashion",
    "Lifestyle",
    "Business",
    "Health",
    "Travel",
    "Food",
  ];

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const [form, setForm] = useState<BlogFormData>({
    title: "",
    content: "",
    links: [],
    imageUrl: "",
    tags: [],
  });

  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BlogFormData>({
    title: "",
    content: "",
    links: [],
    imageUrl: "",
    tags: [],
  });

  const addLock = useRef(false);
  const fetchLock = useRef(false);

  const fetchBlogs = async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    try {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Blog[];

      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setTimeout(() => {
        fetchLock.current = false;
      }, 500);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(
        blogs.filter((b) => b.tags?.includes(selectedTag))
      );
    }
  }, [selectedTag, blogs]);

  const handleChange = (field: keyof BlogFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (index: number, field: keyof { name: string; url: string }, value: string) => {
    const updated = [...form.links];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, links: updated }));
  };

  const addLinkField = () =>
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { name: "", url: "" }],
    }));

  const handleTagToggle = (tag: string) => {
    setForm((prev) => {
      const current = prev.tags || [];
      return current.includes(tag)
        ? { ...prev, tags: current.filter((t) => t !== tag) }
        : { ...prev, tags: [...current, tag] };
    });
  };

  const addBlog = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (addLock.current) return;

      addLock.current = true;

      try {
        await addDoc(collection(db, "blogs"), {
          ...form,
          createdAt: serverTimestamp(),
        });

        setForm({
          title: "",
          content: "",
          links: [],
          imageUrl: "",
          tags: [],
        });

        await fetchBlogs();
      } catch (error) {
        console.error("Error adding blog:", error);
      } finally {
        setTimeout(() => {
          addLock.current = false;
        }, 800);
      }
    },
    [form]
  );

  const deleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blogs", id));
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const startEdit = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setEditForm({
      title: blog.title || "",
      content: blog.content || "",
      links: blog.links || [],
      imageUrl: blog.imageUrl || "",
      tags: blog.tags || [],
    });
  };

  const cancelEdit = () => {
    setEditingBlogId(null);
    setEditForm({
      title: "",
      content: "",
      links: [],
      imageUrl: "",
      tags: [],
    });
  };

  const handleEditChange = (field: keyof BlogFormData, value: any) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleEditLinkChange = (index: number, field: keyof { name: string; url: string }, value: string) => {
    const updated = [...editForm.links];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm((prev) => ({ ...prev, links: updated }));
  };

  const addEditLinkField = () =>
    setEditForm((prev) => ({
      ...prev,
      links: [...prev.links, { name: "", url: "" }],
    }));

  const updateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogId) return;

    try {
      const blogRef = doc(db, "blogs", editingBlogId);
      await updateDoc(blogRef, { ...editForm });

      cancelEdit();
      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>

      <form onSubmit={addBlog} className="space-y-4 mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Add New Blog</h2>

        <div className="space-y-2">
          <label className="font-medium">Title</label>
          <input
            type="text"
            placeholder="Enter blog title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">Content</label>
          <textarea
            placeholder="Enter blog content"
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm border ${form.tags?.includes(tag) ? "bg-black text-white border-black" : "bg-white border-gray-300"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Links</label>
          {form.links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Link Name"
                value={link.name}
                onChange={(e) => handleLinkChange(index, "name", e.target.value)}
                className="border p-1 rounded w-1/3"
              />
              <input
                type="url"
                placeholder="Link URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className="border p-1 rounded w-2/3"
              />
            </div>
          ))}
          <button type="button" onClick={addLinkField} className="px-3 py-1 bg-gray-200 rounded text-sm">
            + Add Link
          </button>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Image URL</label>
          <input
            type="url"
            placeholder="Enter image URL"
            value={form.imageUrl}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
            className="w-full p-2 border rounded"
          />
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt="preview"
              className="w-48 h-32 object-cover rounded-lg border mt-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Add Blog
        </button>
      </form>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedTag === "All" ? "All Blogs" : `${selectedTag} Blogs`}
        </h2>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blogs found{selectedTag !== "All" ? ` for tag "${selectedTag}"` : ""}.
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="border border-gray-200 rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
              {blog.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <h2 className="font-semibold text-xl">{blog.title}</h2>
              <p className="text-gray-700">{blog.content}</p>

              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {blog.links?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Related Links</h4>
                  <ul className="space-y-1">
                    {blog.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {link.name || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => startEdit(blog)}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                >
                  Edit Blog
                </button>
                <button
                  onClick={() => deleteBlog(blog.id)}
                  className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                >
                  Delete Blog
                </button>
              </div>

              {editingBlogId === blog.id && (
                <form onSubmit={updateBlog} className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
                  <h3 className="font-semibold text-lg">Edit Blog</h3>

                  <div className="space-y-2">
                    <label className="font-medium">Title</label>
                    <input
                      type="text"
                      placeholder="Blog Title"
                      value={editForm.title}
                      onChange={(e) => handleEditChange("title", e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Content</label>
                    <textarea
                      placeholder="Blog Content"
                      value={editForm.content}
                      onChange={(e) => handleEditChange("content", e.target.value)}
                      className="w-full p-2 border rounded min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const currentTags = editForm.tags || [];
                            if (currentTags.includes(tag)) {
                              setEditForm(prev => ({ ...prev, tags: currentTags.filter(t => t !== tag) }));
                            } else {
                              setEditForm(prev => ({ ...prev, tags: [...currentTags, tag] }));
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm border ${editForm.tags?.includes(tag)
                              ? "bg-black text-white border-black"
                              : "bg-white border-gray-300"
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Links</label>
                    {editForm.links?.map((link, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Link Name"
                          value={link.name}
                          onChange={(e) =>
                            handleEditLinkChange(index, "name", e.target.value)
                          }
                          className="border p-1 rounded w-1/3"
                        />
                        <input
                          type="url"
                          placeholder="Link URL"
                          value={link.url}
                          onChange={(e) =>
                            handleEditLinkChange(index, "url", e.target.value)
                          }
                          className="border p-1 rounded w-2/3"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditLinkField}
                      className="px-3 py-1 bg-gray-200 rounded text-sm"
                    >
                      + Add Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Image URL</label>
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={editForm.imageUrl}
                      onChange={(e) => handleEditChange("imageUrl", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    {editForm.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editForm.imageUrl}
                        alt="preview"
                        className="w-48 h-32 object-cover rounded-lg border mt-2"
                      />
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Blog
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
