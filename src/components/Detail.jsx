import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Detail() {
  const { id } = useParams(); // Récupérer l'ID à partir de l'URL
  const [post, setPost] = useState(null);

  useEffect(() => {
    // Fetch the specific post based on the ID
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        const foundPost = data.posts.find((p) => p.id === id);
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
