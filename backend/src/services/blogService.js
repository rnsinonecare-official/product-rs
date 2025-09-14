const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const BLOGS_FILE = path.join(__dirname, '../../data/blogs.json');

class BlogService {
  constructor() {
    this.db = admin.firestore();
    this.ensureBlogsFile();
  }

  ensureBlogsFile() {
    if (!fs.existsSync(BLOGS_FILE)) {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify({ blogs: [] }, null, 2));
    }
  }

  loadBlogsFromFile() {
    try {
      const data = fs.readFileSync(BLOGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading blogs from file:', error);
      return { blogs: [] };
    }
  }

  saveBlogsToFile(blogsData) {
    try {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogsData, null, 2));
    } catch (error) {
      console.error('Error saving blogs to file:', error);
    }
  }

  async getAllBlogs() {
    try {
      // Try Firebase first
      const snapshot = await this.db.collection('blogs')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      const blogs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = data.createdAt.toDate().toISOString();
          data.date = data.createdAt;
        }
        blogs.push({ id: doc.id, ...data });
      });

      console.log(`📚 Found ${blogs.length} blogs in Firebase`);
      return blogs;
    } catch (error) {
      console.log('📚 Firebase unavailable, using local blogs file');
      const blogsData = this.loadBlogsFromFile();
      return blogsData.blogs.filter(blog => blog.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  async getBlogById(id) {
    try {
      // Try Firebase first
      const blogDoc = await this.db.collection('blogs').doc(id).get();
      
      if (blogDoc.exists) {
        const data = blogDoc.data();
        if (data.isActive) {
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
            data.date = data.createdAt;
          }
          
          // Increment view count
          await this.db.collection('blogs').doc(id).update({
            views: admin.firestore.FieldValue.increment(1)
          });
          
          return { id: blogDoc.id, ...data };
        }
      }
      return null;
    } catch (error) {
      console.log('📚 Firebase unavailable, using local blogs file');
      const blogsData = this.loadBlogsFromFile();
      const blog = blogsData.blogs.find(b => b.id === id && b.isActive);
      
      if (blog) {
        // Increment view count in local file
        blog.views = (blog.views || 0) + 1;
        this.saveBlogsToFile(blogsData);
      }
      
      return blog || null;
    }
  }

  async createBlog(blogData) {
    try {
      // Try Firebase first
      const docRef = await this.db.collection('blogs').add({
        ...blogData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        views: 0,
      });
      
      const doc = await docRef.get();
      const responseData = doc.data();
      
      if (responseData.createdAt && responseData.createdAt.toDate) {
        responseData.createdAt = responseData.createdAt.toDate().toISOString();
        responseData.date = responseData.createdAt;
      }
      
      return { id: doc.id, ...responseData };
    } catch (error) {
      console.log('📚 Firebase unavailable, saving to local blogs file');
      const blogsData = this.loadBlogsFromFile();
      
      const newBlog = {
        id: 'blog-' + Date.now(),
        ...blogData,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        views: 0,
      };
      
      blogsData.blogs.unshift(newBlog);
      this.saveBlogsToFile(blogsData);
      
      return newBlog;
    }
  }

  async updateBlog(id, updateData) {
    try {
      // Try Firebase first
      await this.db.collection('blogs').doc(id).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      const updatedDoc = await this.db.collection('blogs').doc(id).get();
      const responseData = updatedDoc.data();
      
      if (responseData.createdAt && responseData.createdAt.toDate) {
        responseData.createdAt = responseData.createdAt.toDate().toISOString();
        responseData.date = responseData.createdAt;
      }
      
      return { id: updatedDoc.id, ...responseData };
    } catch (error) {
      console.log('📚 Firebase unavailable, updating local blogs file');
      const blogsData = this.loadBlogsFromFile();
      
      const blogIndex = blogsData.blogs.findIndex(blog => blog.id === id);
      if (blogIndex !== -1) {
        blogsData.blogs[blogIndex] = {
          ...blogsData.blogs[blogIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        this.saveBlogsToFile(blogsData);
        return blogsData.blogs[blogIndex];
      }
      
      throw new Error('Blog not found');
    }
  }

  async deleteBlog(id) {
    try {
      // Try Firebase first
      await this.db.collection('blogs').doc(id).delete();
      return true;
    } catch (error) {
      console.log('📚 Firebase unavailable, deleting from local blogs file');
      const blogsData = this.loadBlogsFromFile();
      
      const blogIndex = blogsData.blogs.findIndex(blog => blog.id === id);
      if (blogIndex !== -1) {
        blogsData.blogs.splice(blogIndex, 1);
        this.saveBlogsToFile(blogsData);
        return true;
      }
      
      throw new Error('Blog not found');
    }
  }

  async getAllBlogsForAdmin() {
    try {
      // Try Firebase first
      const snapshot = await this.db.collection('blogs')
        .orderBy('createdAt', 'desc')
        .get();

      const blogs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt.toDate) {
          data.createdAt = data.createdAt.toDate().toISOString();
          data.date = data.createdAt;
        }
        blogs.push({ id: doc.id, ...data });
      });

      return blogs;
    } catch (error) {
      console.log('📚 Firebase unavailable, using local blogs file for admin');
      const blogsData = this.loadBlogsFromFile();
      return blogsData.blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
}

module.exports = new BlogService();