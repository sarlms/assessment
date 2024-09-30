import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<number>(5);
  const [showScroll, setShowScroll] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [animateNewPosts, setAnimateNewPosts] = useState<boolean>(false); // New state to control new post animations

  const location = useLocation();
  const navigate = useNavigate();

  const checkScrollTop = useCallback(() => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  }, [showScroll]);

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
        setFilteredPosts(data.posts);

        const uniqueCategories: string[] = Array.from(
          new Set(data.posts.flatMap((post: Post) => post.categories.map((c) => c.name)))
        );
        setCategories(uniqueCategories);

        const queryParams = new URLSearchParams(location.search);
        const categoriesFromQuery = queryParams.getAll('category');
        if (categoriesFromQuery.length > 0) {
          setSelectedCategories(categoriesFromQuery);
          filterPostsByCategories(categoriesFromQuery, data.posts);
        }
      });

    window.addEventListener('scroll', checkScrollTop);

    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [location.search, checkScrollTop]);

  const handleCategoryChange = (category: string) => {
    setIsFiltering(true);
    setAnimateNewPosts(false); // Don't animate on filter, only new posts should animate
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);

    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('category');
    updatedCategories.forEach((cat) => queryParams.append('category', cat));
    navigate({ search: queryParams.toString() });

    filterPostsByCategories(updatedCategories, posts);

    // Ajouter un léger délai avant de désactiver l'état de filtrage
    setTimeout(() => {
      setIsFiltering(false);
    }, 500);
  };

  const filterPostsByCategories = (categories: string[], allPosts: Post[]) => {
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
    setAnimateNewPosts(true); // Set flag to animate only new posts
    setVisiblePosts((prevVisiblePosts) => prevVisiblePosts + 5);

    // Stop animation after a short delay
    setTimeout(() => {
      setAnimateNewPosts(false);
    }, 500); // Adjust time to match the animation duration
  };

  const clearFilters = () => {
    setIsFiltering(true);
    setSelectedCategories([]);
    setFilteredPosts(posts);

    navigate({ search: '' });

    setTimeout(() => {
      setIsFiltering(false);
    }, 500);
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
        {filteredPosts.slice(0, visiblePosts).map((post, index) => (
          <div
            key={post.id}
            className={`article-card ${index >= visiblePosts - 5 && animateNewPosts ? 'hidden' : ''}`}
          >
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
};

export default Home;
