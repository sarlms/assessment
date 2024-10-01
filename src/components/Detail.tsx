import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


//interfaces for defining the structure of the data (author, category, and post)
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
  const { id } = useParams<{ id: string }>(); //useParams to extract the id from the URL
  const [post, setPost] = useState<Post | null>(null); //useState to manage the post details
  const navigate = useNavigate();  //hook for navigation

  useEffect(() => {
    //fetching posts from the API when the component mounts or id changes
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        //finding the post that matches the given id
        const foundPost = data.posts.find((p: Post) => p.id === id);
        setPost(foundPost); //set the found post in the state
      });
  }, [id]); //effect depends on the id, runs every time id changes

  if (!post) {
    return <div>Loading...</div>; //show loading state while data is fetched
  }

  //function to go back to the previous page
  const handleBackClick = () => {
    navigate(-1); //navigate back in browser history
  };

  return (
    <article className="detail-container">
      {/*back button with an arrow symbol*/}
      <button className="back-btn" onClick={handleBackClick} aria-label="Retour à l'accueil">
        ⬅
      </button>

      <section className="article-card">
        <header className="article-header">
          <div className="author">
            {/*author's avatar and name*/}
            <img src={post.author.avatar} alt={post.author.name} />
            <div>
              <h4>{post.author.name}</h4>
              <p>{new Date(post.publishDate).toLocaleDateString()}</p>
            </div>
          </div>
        </header>
        <section className="article-content">
          {/*post title and summary*/}
          <h5>{post.title}</h5>
          <p>{post.summary}</p>
          <footer className="article-categories">
            {/*listing the categories associated with the post*/}
            {post.categories.map((category) => (
              <span key={category.id} className="category-tag">
                {category.name}
              </span>
            ))}
          </footer>
        </section>
      </section>
    </article>
  );
};

export default Detail;
