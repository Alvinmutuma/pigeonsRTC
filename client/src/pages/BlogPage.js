import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../styles/BlogPage.css';

const BlogPage = () => {
  return (
    <div className="blog-page">
      <SEO 
        title="PigeonRTC Blog | AI Agent Insights & Updates"
        description="Stay updated with the latest news, insights, and feature updates about AI agents and the PigeonRTC marketplace."
        keywords="PigeonRTC blog, AI agent news, AI insights, AI marketplace updates, artificial intelligence blog"
        url="https://pigeonrtc.com/blog"
        image="https://pigeonrtc.com/images/og-blog.png" 
      />
      
      <div className="blog-container">
        <section className="blog-hero">
          <h1>PigeonRTC Blog</h1>
          <p className="subtitle">Insights, updates, and the future of AI agents</p>
        </section>
        
        <section className="featured-posts">
          <div className="container">
            <h2 className="section-title">Featured Posts</h2>
            <div className="featured-post">
              <div className="post-image">
                <div className="image-placeholder"></div>
              </div>
              <div className="post-content">
                <span className="post-category">Product Roadmap</span>
                <h3>The Future of PigeonRTC: Expected Features & Upcoming Improvements</h3>
                <p className="post-excerpt">
                  Discover what's next for our AI agent marketplace with our comprehensive roadmap of expected features, upcoming developments, and areas we're actively improving.
                </p>
                <div className="post-meta">
                  <span className="post-date">June 1, 2025</span>
                  <span className="post-author">by PigeonRTC Team</span>
                </div>
                <Link to="#" className="read-more">Read Full Article</Link>
              </div>
            </div>
          </div>
        </section>
        
        <div className="blog-content">
          <main className="posts-container">
            <section className="roadmap-section">
              <h2>Our Product Roadmap</h2>
              
              <article className="blog-post">
                <h3>Expected Features (Q3 2025)</h3>
                <p>As we continue to develop PigeonRTC, we're excited to share the features we're currently working on and will be releasing in the coming months:</p>
                <ul className="feature-list">
                  <li>
                    <strong>Multi-agent Workflows</strong>
                    <p>Create powerful automation sequences by chaining multiple AI agents together to handle complex business processes from end to end.</p>
                  </li>
                  <li>
                    <strong>Custom Agent Training</strong>
                    <p>Upload your business documents and data to train agents on your specific industry terminology, processes, and requirements.</p>
                  </li>
                  <li>
                    <strong>Advanced Analytics Dashboard</strong>
                    <p>Gain deeper insights into how AI agents are performing for your business with comprehensive usage metrics and ROI calculations.</p>
                  </li>
                  <li>
                    <strong>Team Collaboration Tools</strong>
                    <p>Manage agent access across your organization with role-based permissions and shared agent configurations.</p>
                  </li>
                  <li>
                    <strong>Voice Interface Integration</strong>
                    <p>Interact with your AI agents through voice commands in our mobile and desktop applications.</p>
                  </li>
                </ul>
              </article>
              
              <article className="blog-post">
                <h3>Features Coming Soon (Q4 2025 - Q1 2026)</h3>
                <p>Looking further ahead, we're planning these exciting additions to the PigeonRTC platform:</p>
                <ul className="feature-list">
                  <li>
                    <strong>Agent Marketplace API</strong>
                    <p>A comprehensive API for developers to build custom integrations and extensions on top of our agent marketplace.</p>
                  </li>
                  <li>
                    <strong>Offline Agent Capabilities</strong>
                    <p>Run selected AI agents locally for improved privacy and performance, even without an internet connection.</p>
                  </li>
                  <li>
                    <strong>Enterprise Knowledge Base Integration</strong>
                    <p>Connect your agents directly to your company's internal knowledge systems, databases, and documents.</p>
                  </li>
                  <li>
                    <strong>Cross-platform Mobile Applications</strong>
                    <p>Native mobile apps for iOS and Android to manage and interact with your AI agents on the go.</p>
                  </li>
                  <li>
                    <strong>AI Agent Marketplace for Specific Industries</strong>
                    <p>Curated collections of agents specialized for healthcare, finance, legal, education, and other specific sectors.</p>
                  </li>
                  <li>
                    <strong>Advanced Security Framework</strong>
                    <p>Enhanced encryption, compliance tools, and audit capabilities for enterprise customers with strict security requirements.</p>
                  </li>
                </ul>
              </article>
              
              <article className="blog-post">
                <h3>Features We're Actively Improving</h3>
                <p>Based on user feedback and our own testing, we're currently working on improvements to these existing features:</p>
                <ul className="feature-list">
                  <li>
                    <strong>Agent Discovery & Recommendation Engine</strong>
                    <p>Making it easier to find the right agents for your specific needs with improved search, filtering, and AI-powered recommendations.</p>
                  </li>
                  <li>
                    <strong>Agent Testing Sandbox</strong>
                    <p>Expanding capabilities to better simulate real-world conditions and providing more detailed performance metrics during testing.</p>
                  </li>
                  <li>
                    <strong>Integration Ecosystem</strong>
                    <p>Adding more native integrations with popular business tools and simplifying the process of connecting agents to your existing workflow.</p>
                  </li>
                  <li>
                    <strong>User Interface & Experience</strong>
                    <p>Refining our dashboard, simplifying complex configuration options, and making the platform more intuitive for non-technical users.</p>
                  </li>
                  <li>
                    <strong>Billing & Subscription Management</strong>
                    <p>Providing more flexible pricing options, improved usage tracking, and clearer billing information.</p>
                  </li>
                  <li>
                    <strong>Community Forum & Knowledge Base</strong>
                    <p>Expanding our documentation, adding more user guides, and fostering a more active community of agent developers and business users.</p>
                  </li>
                </ul>
              </article>
            </section>
            
            <div className="cta-box">
              <h3>Have Feature Suggestions?</h3>
              <p>We're always looking to improve our platform based on user feedback. Let us know what features you'd like to see!</p>
              <Link to="/contact" className="btn btn-primary">Submit Feedback</Link>
            </div>
          </main>
          
          <aside className="blog-sidebar">
            <div className="sidebar-section categories">
              <h3>Categories</h3>
              <ul>
                <li><Link to="#">Product Updates</Link></li>
                <li><Link to="#">Tutorials</Link></li>
                <li><Link to="#">Case Studies</Link></li>
                <li><Link to="#">Industry Insights</Link></li>
                <li><Link to="#">Developer Resources</Link></li>
              </ul>
            </div>
            
            <div className="sidebar-section recent-posts">
              <h3>Recent Posts</h3>
              <ul>
                <li>
                  <Link to="#">How AI Agents Are Transforming Customer Service</Link>
                  <span className="post-date">May 24, 2025</span>
                </li>
                <li>
                  <Link to="#">Developer Spotlight: Creating Your First AI Agent</Link>
                  <span className="post-date">May 17, 2025</span>
                </li>
                <li>
                  <Link to="#">Case Study: How Acme Corp Automated 75% of Their Data Entry</Link>
                  <span className="post-date">May 8, 2025</span>
                </li>
                <li>
                  <Link to="#">Best Practices for Integrating AI Agents With Slack</Link>
                  <span className="post-date">April 30, 2025</span>
                </li>
              </ul>
            </div>
            
            <div className="sidebar-section newsletter">
              <h3>Stay Updated</h3>
              <p>Subscribe to our newsletter to get the latest updates and articles delivered directly to your inbox.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Your email address" required />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
