import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Tag,
  Eye,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchRelatedBlogs();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/blogs/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
      } else if (response.status === 404) {
        toast.error("Blog not found");
        navigate("/blogs");
      } else {
        throw new Error("Failed to fetch blog");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Failed to load blog");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/blogs`);
      if (response.ok) {
        const data = await response.json();
        // Get random 3 blogs excluding current one
        const filtered = data.filter((b) => b.id !== id);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedBlogs(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "Removed from favorites" : "Added to favorites");
  };

  const handleRelatedBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg font-medium">Blog not found.</p>
            <button
              onClick={() => navigate("/blogs")}
              className="mt-4 bg-sage-green text-white px-6 py-2 rounded-full hover:bg-sage-green/90 transition-colors font-bold shadow-lg"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/blogs")}
          className="flex items-center space-x-2 bg-white/90 text-gray-900 hover:bg-white hover:text-sage-green transition-colors mb-6 font-bold px-4 py-2 rounded-full shadow-md border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Blogs</span>
        </button>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://static.vecteezy.com/system/resources/previews/035/947/339/non_2x/blog-3d-illustration-icon-png.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            {/* Category Badge */}
            {blog.category && (
              <div className="absolute top-6 left-6">
                <span className="bg-sage-green text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {blog.category}
                </span>
              </div>
            )}
          </div>

          {/* Article Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-white/50">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 drop-shadow-sm">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-6 text-gray-800">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-sage-green" />
                  <span className="font-bold text-gray-900">{blog.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sage-green" />
                  <span className="font-semibold text-gray-800">
                    {formatDate(blog.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-sage-green" />
                  <span className="font-semibold text-gray-800">
                    {getReadingTime(blog.content)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-sage-green" />
                  <span className="font-semibold text-gray-800">
                    {blog.views || 0} views
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    liked
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  <span>{liked ? "Liked" : "Like"}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-sage-green text-white hover:bg-sage-green/90 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 bg-powder-blue/30 text-sage-green px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="bg-sage-green/10 border-l-4 border-sage-green p-4 rounded-r-lg mb-6">
                <p className="text-gray-900 italic text-lg font-semibold leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base font-medium">
                {blog.content}
              </div>
            </div>
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div
                    key={relatedBlog.id}
                    onClick={() => handleRelatedBlogClick(relatedBlog.id)}
                    className="cursor-pointer group"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                      <img
                        src={relatedBlog.cover_image}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/035/947/339/non_2x/blog-3d-illustration-icon-png.png";
                        }}
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-sage-green transition-colors line-clamp-2 mb-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-800 line-clamp-2 font-semibold">
                      {relatedBlog.excerpt}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-700 mt-2 font-semibold">
                      <span>{relatedBlog.author}</span>
                      <span>•</span>
                      <span>{formatDate(relatedBlog.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
