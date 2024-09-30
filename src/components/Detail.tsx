import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Author {
  name: string;
  avatar: string;
}

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  publishDate: string;
  author: Author;
  summary: string;
  categories: Category[];
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        const foundPost = data.posts.find((p: Post) => p.id === id);
        setPost(foundPost);
      });
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-container">
      <div className="article-card">
        <div className="article-header">
          <div className="author">
            <img src={post.author.avatar} alt={post.author.name} />
            <div>
              <h4>{post.author.name}</h4>
              <p>{new Date(post.publishDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="article-content">
          <h5>{post.title}</h5>
          <p>{post.summary}</p>
          <div className="article-categories">
            {post.categories.map((category) => (
              <span key={category.id} className="category-tag">
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
