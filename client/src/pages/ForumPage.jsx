// client/src/pages/ForumPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Added for navigation
import { useQuery } from '@apollo/client'; // Import useQuery
import { useAuth } from '../contexts/AuthContext'; // Added to check user login status
import { GET_FORUM_CATEGORIES } from '../graphql/queries'; // Import the query
// Assuming UI components are in a structure like client/src/components/ui
// Adjust paths if your project structure is different.
import { Card, CardContent } from '../components/ui/Card'; 
import Button from '../components/ui/Button';
import Input from '../components/ui/Input'; // Changed to default import
// import { Select, SelectItem } from '../components/ui/select'; // Assuming Select and SelectItem are separate or part of a Select component
import Badge from '../components/ui/Badge'; // Changed to default import
import { FaArrowUp, FaArrowDown, FaSearch, FaPlus } from 'react-icons/fa';
import './ForumPage.css';

// Dummy data as provided in the prompt
const posts = [
  {
    id: '1',
    title: "How to deploy my AI agent on the marketplace?",
    author: "JaneDoeAI",
    authorKarma: 120,
    timeSincePosted: "2 hours ago",
    upvotes: 42,
    commentsCount: 12,
    tags: ["Deployment", "Agent"],
  },
  {
    id: '2',
    title: "Need help integrating GPT-4 API",
    author: "DevGuru",
    authorKarma: 105,
    timeSincePosted: "5 hours ago",
    upvotes: 30,
    commentsCount: 8,
    tags: ["Integration", "OpenAI"],
  },
  {
    id: '3',
    title: "Best practices for AI agent security",
    author: "SecureAI",
    authorKarma: 95,
    timeSincePosted: "1 day ago",
    upvotes: 55,
    commentsCount: 15,
    tags: ["Security", "Best Practices"],
  },
];

// const categories = [...] // Dummy categories removed, will be fetched

const topContributors = [
  { name: "JaneDoeAI", karma: 120, avatar: 'JD' }, // Simple avatar placeholder
  { name: "DevGuru", karma: 105, avatar: 'DG' },
  { name: "BizBoss", karma: 98, avatar: 'BB' },
  { name: "SecureAI", karma: 95, avatar: 'SA' },
  { name: "InnovateUser", karma: 80, avatar: 'IU' },
];

const trendingTags = ["Deployment", "GPT-4", "Security", "Marketplace", "Integration"];

const ForumPage = () => {
  const { user } = useAuth(); // Get user to check if logged in
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_FORUM_CATEGORIES);

  // TODO: Add state for search, filters, current page, etc.
  // TODO: Fetch real data for posts using GraphQL queries

  return (
    <div className="forum-page-container">
      {/* Header placeholder - actual header would be part of the main App layout */}
      <header className="forum-header sticky-header">
        <div className="forum-logo">PigeonRTC Forum</div>
        <div className="global-search-bar">
          <FaSearch className="search-icon" />
          <Input type="search" placeholder="Search posts, topics, or users…" className="global-search-input" />
        </div>
        <div className="profile-dropdown-placeholder">
          {/* Placeholder for profile dropdown */}
          User Profile
        </div>
      </header>

      <main className="forum-main-content">
        {/* Left Sidebar: Categories */}
        <aside className="forum-sidebar-left">
          <h3 className="sidebar-title">Categories</h3>
          {categoriesLoading && <p>Loading categories...</p>}
          {categoriesError && <p>Error loading categories: {categoriesError.message}</p>}
          {categoriesData && categoriesData.forumCategories && categoriesData.forumCategories.length > 0 ? (
            <ul className="category-list">
              {categoriesData.forumCategories.map(category => (
                <li key={category.id} className="category-list-item">
                  <span className="category-icon">{category.icon || '📁'}</span> {/* Default icon if not provided */}
                  <span className="category-name">{category.name}</span>
                  {/* <p className="category-description">{category.description}</p> */}
                </li>
              ))}
            </ul>
          ) : (
            !categoriesLoading && !categoriesError && (
            <div>
              <p>No categories found. Check back soon!</p>
              {user && (
                <p>
                  Why not create one?{' '}
                  <Link to="/community/create">Start a new community topic.</Link>
                </p>
              )}
            </div>
          )
          )}
        </aside>

        {/* Center Column: Post Feed */}
        <section className="forum-post-feed">
          <div className="feed-controls">
            {/* Sorting options placeholder */}
            <Button variant="outline">Trending</Button>
            <Button variant="ghost">Recent</Button>
            <Button variant="ghost">Most Commented</Button>
          </div>
          {posts.map((post) => (
            <Card key={post.id} className="post-card">
              <CardContent className="post-card-content">
                <div className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-votes">
                    <Button variant="ghost" size="sm" aria-label="Upvote"><FaArrowUp /></Button>
                    <span>{post.upvotes}</span>
                    <Button variant="ghost" size="sm" aria-label="Downvote"><FaArrowDown /></Button>
                  </div>
                </div>
                <div className="post-meta">
                  <span className="post-author">Posted by {post.author}</span>
                  <span className="post-time">{post.timeSincePosted}</span>
                  <span className="post-comments-count">{post.commentsCount} comments</span>
                </div>
                <div className="post-tags">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Button variant="primary" className="view-post-button">View Post</Button>
              </CardContent>
            </Card>
          ))}
          {/* Pagination placeholder */}
          <div className="pagination-bar">
            <Button variant="ghost">Previous</Button>
            <span className="page-info">Page 1 of 5</span>
            <Button variant="ghost">Next</Button>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="forum-sidebar-right">
          <Button className="create-post-button-main">
            <FaPlus style={{ marginRight: '8px' }} /> Create New Post
          </Button>
          
          <Card className="sidebar-card">
            <CardContent>
              <h3 className="sidebar-title">Trending Posts</h3>
              <ul className="trending-posts-list">
                {posts.slice(0, 3).map(p => (
                  <li key={`trending-${p.id}`}>{p.title} ({p.upvotes} votes)</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="sidebar-card">
            <CardContent>
              <h3 className="sidebar-title">Top Contributors</h3>
              <ul className="contributors-list">
                {topContributors.map(user => (
                  <li key={user.name}>
                    <span className="contributor-avatar">{user.avatar}</span> 
                    {user.name} – {user.karma} karma
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="sidebar-card">
            <CardContent>
              <h3 className="sidebar-title">Suggested Tags</h3>
              <div className="suggested-tags-list">
                {trendingTags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

        </aside>
      </main>
      {/* Floating Action Button for New Post - could be an alternative to the one in sidebar */}
      {/* <Button className="fab-create-post"><FaPlus /></Button> */}
    </div>
  );
};

export default ForumPage;
