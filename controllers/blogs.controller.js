import { deleteImageUpdate, uploadFile } from "../helper/configFile.js";
import BlogData from "../models/blogs.models.js";

const createBlog = async (req, res) => {
    const { publisher, title, description, date } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Gambar harus di-upload' });
    }

    try {
        const imageUrl = await uploadFile(req.file);
        console.log(imageUrl);


        const newBlog = new BlogData({
            publisher,
            title,
            description,
            date,
            image: imageUrl,
        });

        const savedBlog = await newBlog.save();

        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat blog', error: error.message });
    }
};

const getBlogs = async (req, res) => {
    try {
        const blogs = await BlogData.find().sort({ createdAt: -1 });

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan data blog', error: error.message });
    }
};

const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, story } = req.body;
    const image = req.file;

    if (!title || !description || !date || !story) {
        return res.status(400).json({ message: 'Semua form harus diisi' });
    }

    try {
        const blog = await BlogData.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog tidak ditemukan' });
        }

        blog.title = title;
        blog.description = description;
        blog.date = date;
        blog.story = story;

        if (image) {
            if (blog.image) {
                const fileName = blog.image.split('/').pop();
                const deleteResult = await deleteImageUpdate(fileName);
                console.log(deleteResult);

                if (!deleteResult.success) {
                    return res.status(500).json({ message: deleteResult.message });
                }
            }

            const imageUrl = await uploadFile(image);
            blog.image = imageUrl;
        }

        const updatedBlog = await blog.save();

        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui blog' });
    }
};

const deleteBlog = async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await BlogData.findByIdAndDelete(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog tidak ditemukan' });
        }

        if (blog.image) {
            const fileName = blog.image.split('/').pop();
            const deleteResult = await deleteImageUpdate(fileName);
            if (!deleteResult.success) {
                return res.status(500).json({ message: deleteResult.message });
            }
        }

        res.status(200).json({ message: 'Blog berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus blog' });
    }
};

const detailBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await BlogData.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const { story, date, description, image } = blog;

        res.status(200).json({ story, date, description, image });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


export { createBlog, getBlogs, updateBlog, deleteBlog, detailBlog };