import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

const Home: React.FC = () => {
  //state for storing the list of posts and filtered posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  
  //state for storing categories and selected categories
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  //state for controlling the visible posts and animations
  const [visiblePosts, setVisiblePosts] = useState<number>(5);
  const [showScroll, setShowScroll] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [animateNewPosts, setAnimateNewPosts] = useState<boolean>(false);

  //hooks for location and navigation
  const location = useLocation();
  const navigate = useNavigate();

  //check if the user has scrolled enough to show the scroll-to-top button
  const checkScrollTop = useCallback(() => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  }, [showScroll]);

  //useEffect to fetch posts from API and set initial categories and posts
  useEffect(() => {
    fetch('/api/posts')
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts); //store all posts in state
        setFilteredPosts(data.posts); //initialize filtered posts with all posts

        //extract unique categories from the posts
        const uniqueCategories: string[] = Array.from(
          new Set(data.posts.flatMap((post: Post) => post.categories.map((c) => c.name)))
        );
        setCategories(uniqueCategories); //set unique categories

        //check if categories exist in the query params and apply them
        const queryParams = new URLSearchParams(location.search);
        const categoriesFromQuery = queryParams.getAll('category');
        if (categoriesFromQuery.length > 0) {
          setSelectedCategories(categoriesFromQuery);
          filterPostsByCategories(categoriesFromQuery, data.posts); //apply initial filters
        }
      });

    window.addEventListener('scroll', checkScrollTop); //add scroll listener

    //reset filters when user clicks on the logo
    if (location.state?.resetFilters) {
      clearFilters();
    }

    return () => {
      window.removeEventListener('scroll', checkScrollTop); //cleanup scroll listener
    };
  }, [location.search, location.state, checkScrollTop]);

  //handle category selection/deselection and filter posts accordingly
  const handleCategoryChange = (category: string) => {
    setIsFiltering(true); //indicate filtering state
    setAnimateNewPosts(false); //reset animations

    //toggle category selection
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories); //update selected categories

    //update the URL query string with selected categories
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('category'); //clear previous categories
    updatedCategories.forEach((cat) => queryParams.append('category', cat)); //add new categories
    navigate({ search: queryParams.toString() }); //navigate with updated query

    filterPostsByCategories(updatedCategories, posts); //filter posts based on categories

    setTimeout(() => {
      setIsFiltering(false); //reset filtering state after animation
    }, 500);
  };

  //filter posts based on selected categories
  const filterPostsByCategories = (categories: string[], allPosts: Post[]) => {
    if (categories.length === 0) {
      setFilteredPosts(allPosts); //if no category is selected, show all posts
    } else {
      const filtered = allPosts.filter((post) =>
        post.categories.some((cat) => categories.includes(cat.name))
      );
      setFilteredPosts(filtered); //update filtered posts
    }
  };

  //handle loading more posts by increasing the number of visible posts
  const loadMore = () => {
    setAnimateNewPosts(true); //start animation for new posts
    setVisiblePosts((prevVisiblePosts) => prevVisiblePosts + 5); //show 5 more posts

    setTimeout(() => {
      setAnimateNewPosts(false); //stop animation after 500ms
    }, 500);
  };

  //clear all filters and show all posts
  const clearFilters = () => {
    setIsFiltering(true); //indicate filtering state
    setSelectedCategories([]); //clear selected categories
    setFilteredPosts(posts); //reset filtered posts to all posts
    navigate({ search: '' }); //clear query params

    setTimeout(() => {
      setIsFiltering(false); //reset filtering state after animation
    }, 500);
  };

  //scroll to the top of the page when called
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="main-container">
      <aside className="sidebar">
        <div className="filter-box">
          <h3>Filtrer par catégories</h3>
          <ul>
            {/* render the list of categories with checkboxes*/}
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
            {/*button to clear all filters*/}
            <button className="clear-btn" onClick={clearFilters}>CLEAR</button>
          </div>
        </div>
      </aside>

      <section className="content">
        {/* render filtered posts and apply animations*/}
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
        {/* show the "load more" button if there are more posts to show*/}
        {visiblePosts < filteredPosts.length && (
          <button className="load-more" onClick={loadMore}>LOAD MORE</button>
        )}
      </section>

      {/*scroll-to-top button */}
      <div className={`scroll-to-top ${showScroll ? 'show' : ''}`} onClick={scrollToTop}>
        ⬆
      </div>
    </div>
  );
};

export default Home;
