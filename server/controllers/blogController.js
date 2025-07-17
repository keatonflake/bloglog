import { BlogModel } from "../Models/BlogModel.js";

export const getUserBlogs = async (req, res) => {
  try {
    const { search, status } = req.query;
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    const query = { authorId: req.user._id };

    if (status) {
      query.status = status;
    }

    let blogs = await BlogModel.find(query).sort({ updatedAt: -1 });

    if (search) {
      const searchTerm = search.toString().toLowerCase();
      blogs = blogs.filter((blog) => {
        return (
          blog.title.toLowerCase().includes(searchTerm) ||
          blog.authors.some((author) => {
            author.toLowerCase().includes(searchTerm);
          })
        );
      });

      return false;
    }

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error gettign user blogs", error);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Validate blogId
    if (!blogId) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    // Find the blog by ID
    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.status === "published") {
      return res.status(200).json(blog);
    } else {
      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Authentication required to view this blog" });
      }

      if (blog.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          error:
            "Access Denied. You can only view your own drafts/archived blogs",
        });
      }

      return res.status(200).json(blog);
    }
  } catch (error) {
    console.error("Error fetching blog:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, tags, status = "draft" } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    if (title.length > 200) {
      return res
        .status(400)
        .json({ error: "Title must be less than 200 characters" });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        error: "Content is too long",
      });
    }

    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be draft, published, or archived",
      });
    }

    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags
          .filter((tag) => tag && typeof tag === "string")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length <= 50)
          .slice(0, 10);
      } else if (typeof tags === "string") {
        processedTags = tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length <= 50)
          .slice(0, 10);
      }
    }

    processedTags = [...new Set(processedTags)];

    const newBlog = new BlogModel({
      title: title.trim(),
      content,
      tags: processedTags,
      status,
      authorId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedBlog = await newBlog.save();

    return res.status(201).json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Blog with this title already exists",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content, tags, status } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog Not Found" });
    }

    if (blog.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not Authorized to edit this blog" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required" });
    }

    if (title.length > 200) {
      return res
        .status(400)
        .json({ error: "Title must be less than 200 characters" });
    }

    const validStatuses = ["draft", "published", "archived"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid Status" });
    }

    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags
          .filter((tag) => tag && typeof tag === "string")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length <= 50)
          .slice(0, 10);
      }
    }
    processedTags = [...new Set(processedTags)];

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      blogId,
      {
        title: title.trim(),
        content,
        tags: processedTags,
        status: status || blog.status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Blog updated Successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    const { blogId } = req.params;

    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ error: "Not Authorized to delete this blog" });
    }

    await BlogModel.findByIdAndDelete(blogId);

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
