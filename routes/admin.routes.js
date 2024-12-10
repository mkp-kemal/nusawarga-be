import express from 'express'
import { decodeToken, getIsAuth, login, users } from '../controllers/login.controller.js'
import protectRoute from '../middleware/protected.js'
import { createBlog, deleteBlog, detailBlog, getBlogs, updateBlog } from '../controllers/blogs.controller.js'
import { upload } from '../helper/configFile.js'

const router = express.Router()

router.post('/login', login)
router.get('/user', protectRoute, users)
router.post('/blog/post', upload.single('image'), createBlog);
router.get('/blogs', getBlogs);
router.get('/validate', getIsAuth);
router.get('/me', protectRoute, decodeToken);
router.put('/blog/:id', upload.single('image'), updateBlog)
router.delete('/blog/:id', protectRoute, deleteBlog)
router.get('/blog/:id', detailBlog)

export default router