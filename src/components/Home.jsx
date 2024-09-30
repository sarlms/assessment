import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [showScroll, setShowScroll] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Définition de checkScrollTop avec useCallback pour éviter de recréer la fonction à chaque rendu
  const checkScrollTop = useCallback(() => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  }, [showScroll]); // Ajout de showScroll en tant que dépendance

  useEffect(() => {
    // Fetch data from the mock API
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
        setFilteredPosts(data.posts);

        const uniqueCategories = [
          ...new Set(data.posts.flatMap((post) => post.categories.map((c) => c.name)))
        ];
        setCategories(uniqueCategories);

        const queryParams = new URLSearchParams(location.search);
        const categoriesFromQuery = queryParams.getAll('category');
        if (categoriesFromQuery.length > 0) {
          setSelectedCategories(categoriesFromQuery);
          filterPostsByCategories(categoriesFromQuery, data.posts);
        }
      });

    // Ajouter l'écouteur de scroll
    window.addEventListener('scroll', checkScrollTop);

    // Nettoyage lors du démontage
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [location.search, checkScrollTop]); // Ajout de checkScrollTop dans les dépendances

  const handleCategoryChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);

    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('category');
    updatedCategories.forEach((cat) => queryParams.append('category', cat));
    navigate({ search: queryParams.toString() });

    filterPostsByCategories(updatedCategories, posts);
  };

  const filterPostsByCategories = (categories, allPosts) => {
    if (categories.length === 0) {
      setFilteredPosts(allPosts);
    } else {
      const filtered = allPosts.filter((post) =>
        post.categories.some((cat) => categories.includes(cat.name))
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

    navigate({ search: '' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="main-container">
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
              <Link to={`/detail/${post.id}`}>
                <button className="detail-btn">DETAILS</button>
              </Link>
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
        {visiblePosts < filteredPosts.length && (
          <button className="load-more" onClick={loadMore}>LOAD MORE</button>
        )}
      </section>

      <div className={`scroll-to-top ${showScroll ? 'show' : ''}`} onClick={scrollToTop}>
        ⬆
      </div>
    </div>
  );
}

export default Home;
