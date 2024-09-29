import React, { useState, useEffect } from 'react';
import lizardLogo from '../assets/lizard-logo.png'; // Importation de l'image

// The mock API is already set up, and the CSS is imported in index.jsx

function App() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    // Fetch data from the mock API
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
        setFilteredPosts(data.posts); // Start with all posts shown
        // Extract unique categories
        const uniqueCategories = [
          ...new Set(data.posts.flatMap((post) => post.categories.map((c) => c.name)))
        ];
        setCategories(uniqueCategories);
      });

      // Écouter le scroll pour montrer/cacher la flèche
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };

  }, []);

  // Vérifier si l'utilisateur a scrollé pour afficher la flèche
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleCategoryChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);

    // Filter posts based on selected categories
    if (updatedCategories.length === 0) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) =>
        post.categories.some((cat) => updatedCategories.includes(cat.name))
      );
      setFilteredPosts(filtered);
    }
  };

  const loadMore = () => {
    setVisiblePosts((prevVisiblePosts) => prevVisiblePosts + 5);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilteredPosts(posts);
  };

  return (
    <div>
      {/* Header */}
      <header>
        <img src={lizardLogo} alt="Lizard Logo" className="lizard-logo" />
      </header>

      {/* Main layout */}
      <div className="main-container">
        {/* Sidebar for filters */}
        <aside className="sidebar">
          <div className="filter-box">
            <h3>Filtrer par catégories</h3>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    {category}
                  </label>
                </li>
              ))}
            </ul>
            <div>
              <button className="clear-btn" onClick={clearFilters}>CLEAR</button>
            </div>
          </div>
        </aside>

        {/* Content section for articles */}
        <section className="content">
          {filteredPosts.slice(0, visiblePosts).map((post) => (
            <div key={post.id} className="article-card">
              <div className="article-header">
                <div className="author">
                  <img src={post.author.avatar} alt={post.author.name} />
                  <div>
                    <h4>{post.author.name}</h4>
                    <p>{new Date(post.publishDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="detail-btn">DETAILS</button>
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
          ))}

          {/* Load more button */}
          {visiblePosts < filteredPosts.length && (
            <button className="load-more" onClick={loadMore}>
              LOAD MORE
            </button>
          )}
        </section>
        </div>
        {/* Flèche pour remonter en haut */}
        <div className={`scroll-to-top ${showScroll ? 'show' : ''}`} onClick={scrollToTop}>
          ⬆
      </div>
    </div>
  );
}

export default App;
