"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import db from "@/lib/firebaseClient";

// ============================================================
// TYPES
// ============================================================

interface Link {
  name: string;
  url: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  links: Link[];
  imageUrl: string;
  tags: string[];
  createdAt?: any;
}

interface BlogForm {
  title: string;
  content: string;
  links: Link[];
  imageUrl: string;
  tags: string[];
}

// ============================================================
// RICH TEXT EDITOR COMPONENT
// ============================================================

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder = "Write your blog content..." }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Typography,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="border border-gray-300 rounded-lg p-4 min-h-[200px]">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300 sticky top-0 z-10">
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-gray-300 font-bold" : ""
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-300 font-bold" : ""
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-gray-300 font-bold" : ""
            }`}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 4 }) ? "bg-gray-300 font-bold" : ""
            }`}
          >
            H4
          </button>
        </div>

        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("bold") ? "bg-gray-300 font-bold" : ""
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("italic") ? "bg-gray-300 italic" : ""
            }`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("underline") ? "bg-gray-300 underline" : ""
            }`}
          >
            <u>U</u>
          </button>
        </div>

        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("bulletList") ? "bg-gray-300" : ""
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("orderedList") ? "bg-gray-300" : ""
            }`}
          >
            1. List
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("paragraph") ? "bg-gray-300" : ""
            }`}
          >
            Paragraph
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[300px] prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
};

// ============================================================
// MAIN BLOGS PAGE
// ============================================================

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

  // STATE
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const [form, setForm] = useState<BlogForm>({
    title: "",
    content: "",
    links: [],
    imageUrl: "",
    tags: [],
  });

  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BlogForm>({
    title: "",
    content: "",
    links: [],
    imageUrl: "",
    tags: [],
  });

  // REFS FOR LOCKS
  const addLock = useRef<boolean>(false);
  const fetchLock = useRef<boolean>(false);

  // ============================================================
  // FETCH BLOGS
  // ============================================================
  const fetchBlogs = useCallback(async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    try {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Blog, "id">),
      }));

      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setTimeout(() => {
        fetchLock.current = false;
      }, 500);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // ============================================================
  // FILTER TAGS
  // ============================================================
  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter((b) => b.tags?.includes(selectedTag)));
    }
  }, [selectedTag, blogs]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  const handleChange = (field: keyof BlogForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const updated = [...form.links];
    updated[index][field] = value;
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

  // ============================================================
  // ADD BLOG
  // ============================================================
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
    [form, fetchBlogs]
  );

  // ============================================================
  // DELETE BLOG
  // ============================================================
  const deleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blogs", id));
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  // ============================================================
  // EDIT BLOG
  // ============================================================
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

  const handleEditChange = (field: keyof BlogForm, value: any) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleEditLinkChange = (index: number, field: keyof Link, value: string) => {
    const updated = [...editForm.links];
    updated[index][field] = value;
    setEditForm((prev) => ({ ...prev, links: updated }));
  };

  const addEditLinkField = () =>
    setEditForm((prev) => ({
      ...prev,
      links: [...prev.links, { name: "", url: "" }],
    }));

  const handleEditTagToggle = (tag: string) => {
    setEditForm((prev) => {
      const current = prev.tags || [];
      return current.includes(tag)
        ? { ...prev, tags: current.filter((t) => t !== tag) }
        : { ...prev, tags: [...current, tag] };
    });
  };

  const updateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogId) return;

    try {
      const blogRef = doc(db, "blogs", editingBlogId);
      await updateDoc(blogRef, { ...editForm });
      cancelEdit();
      await fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  // Sample content with proper formatting
  const sampleContent = `
    <h1>What is SEO?</h1>
    <p>SEO (Search Engine Optimization) is the process of improving a website so that it ranks higher in search engine results such as Google. A higher ranking means more people can find your business online.</p>
    <p>For example, when someone searches for <strong>"web development company in Ahmedabad"</strong> or <strong>"digital marketing services in Gujarat"</strong>, SEO helps your website appear among the top results.</p>

    <h2>Benefits of SEO for Your Business</h2>

    <h3>1. Increases Website Traffic</h3>
    <p>Good SEO brings organic visitors to your website without paying for ads. More traffic means more potential customers.</p>

    <h3>2. Builds Trust and Credibility</h3>
    <p>Users trust websites that appear on the first page of Google. SEO helps improve your brand reputation.</p>

    <h3>3. Generates Quality Leads</h3>
    <p>People searching for your services already have an interest in them. SEO attracts targeted visitors who are more likely to contact you.</p>

    <h3>4. Long-Term Marketing Strategy</h3>
    <p>Unlike paid ads, SEO continues to bring visitors over time, making it a cost-effective investment.</p>

    <h3>5. Improves User Experience</h3>
    <p>SEO includes faster website speed, mobile-friendly design, easy navigation, and quality content, all of which improve user experience.</p>

    <h2>Key SEO Strategies We Use</h2>

    <h3>Keyword Research</h3>
    <p>We identify the exact words and phrases customers use when searching for services related to your business.</p>

    <h3>On-Page SEO</h3>
    <ul>
      <li>Optimized page titles</li>
      <li>Meta descriptions</li>
      <li>Heading structure (H1, H2, H3)</li>
      <li>Image optimization</li>
      <li>Internal linking</li>
    </ul>

    <h3>Technical SEO</h3>
    <ul>
      <li>Fast loading speed</li>
      <li>Mobile responsiveness</li>
      <li>Secure HTTPS website</li>
      <li>XML sitemap</li>
      <li>Proper indexing</li>
    </ul>

    <h3>Content Marketing</h3>
    <p>Publishing useful blogs, guides, and service pages helps Google understand your expertise and improves rankings.</p>

    <h3>Local SEO</h3>
    <p>For local businesses, we optimize Google Business Profile and local keywords so customers nearby can find you easily.</p>

    <h2>Common SEO Mistakes to Avoid</h2>
    <ul>
      <li>Using duplicate content</li>
      <li>Ignoring mobile optimization</li>
      <li>Missing meta titles and descriptions</li>
      <li>Slow website speed</li>
      <li>Not updating content regularly</li>
      <li>Using irrelevant keywords excessively</li>
    </ul>

    <h2>Why Choose DCode Technologies?</h2>
    <p>DCode Technologies provides professional web development and digital marketing services tailored to your business goals. Our SEO approach focuses on real growth, better rankings, and measurable results.</p>
    <p>Whether you are a startup, small business, or growing enterprise, we have the right solution for you.</p>
  `;

  // Load sample content
  const loadSampleContent = () => {
    setForm((prev) => ({
      ...prev,
      content: sampleContent,
      title: "Complete Guide to SEO in 2024",
      tags: ["Tech", "Business"],
    }));
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>

      {/* Add Blog Form */}
      <form onSubmit={addBlog} className="space-y-4 mb-8 p-6 border rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Blog</h2>
          <button
            type="button"
            onClick={loadSampleContent}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
          >
            📄 Load Sample Content
          </button>
        </div>

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
          <div className="text-sm text-gray-500 mb-2">
            💡 Use the toolbar above to format your text. Select text and click H1, H2, H3, Bold, Italic, or Lists.
          </div>
          <RichTextEditor
            value={form.content}
            onChange={(html) => handleChange("content", html)}
            placeholder="Write your blog content..."
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
                className={`px-3 py-1 rounded-full text-sm border ${
                  form.tags?.includes(tag)
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Links</label>
          {form.links.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Link Name"
                value={link.name}
                onChange={(e) => handleLinkChange(index, "name", e.target.value)}
                className="border p-2 rounded w-1/3"
              />
              <input
                type="url"
                placeholder="Link URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className="border p-2 rounded w-2/3"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addLinkField}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
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
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {form.imageUrl && (
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

      {/* Tag Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag("All")}
          className={`px-3 py-1 rounded-full text-sm border ${
            selectedTag === "All"
              ? "bg-black text-white border-black"
              : "bg-white border-gray-300 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedTag === tag
                ? "bg-black text-white border-black"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Blogs List */}
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
            <div
              key={blog.id}
              className="border border-gray-200 rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow bg-white"
            >
              {blog.imageUrl && (
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <h2 className="text-2xl font-bold text-gray-900">{blog.title}</h2>

              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-5
                  prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-4
                  prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-gray-900
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                  prose-li:text-gray-700 prose-li:mb-1
                  prose-a:text-blue-600 prose-a:underline"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {blog.links?.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-semibold text-gray-900 mb-2">Related Links</h4>
                  <ul className="space-y-1">
                    {blog.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {link.name || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => startEdit(blog)}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                >
                  ✏️ Edit Blog
                </button>
                <button
                  onClick={() => deleteBlog(blog.id)}
                  className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                >
                  🗑️ Delete Blog
                </button>
              </div>

              {editingBlogId === blog.id && (
                <form
                  onSubmit={updateBlog}
                  className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3"
                >
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
                    <RichTextEditor
                      value={editForm.content}
                      onChange={(html) => handleEditChange("content", html)}
                      placeholder="Update your blog content..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleEditTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            editForm.tags?.includes(tag)
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
                          className="border p-2 rounded w-1/3"
                        />
                        <input
                          type="url"
                          placeholder="Link URL"
                          value={link.url}
                          onChange={(e) =>
                            handleEditLinkChange(index, "url", e.target.value)
                          }
                          className="border p-2 rounded w-2/3"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditLinkField}
                      className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
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