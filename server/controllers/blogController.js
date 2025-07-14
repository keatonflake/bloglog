import { BlogModel } from "../Models/BlogModel.js";

export const getUserBlogs = async (req, res) => {
  try {
    const { search, status } = req.query;
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    let blogs = await BlogModel.find(query)
      .populate("blogId")
      .sort({ dateUpdated: -1 });

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

    return res.status(200).json(bookLogs);
  } catch (error) {
    console.error("Error gettign user books", error);
  }
};

export const editBlog = async (req, res) => {};
