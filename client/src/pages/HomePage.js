import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { AGENT_STATUS } from '../graphql/queries';
import SEO from '../components/SEO';
import '../styles/HomePage.css';

import { FaPuzzlePiece, FaStore, FaUsers } from 'react-icons/fa'; 
import HeroIllustration from '../assets/hero-illustration.svg'; // Keep if custom and theme-appropriate

const GET_FEATURED_AGENTS = gql`
  query GetFeaturedAgents {
    agents(status: ${AGENT_STATUS.ACTIVE}) {
      id
      name
      description
      category
      tags
      pricing {
        amount
        currency
        type
      }
      developer {
        username
      }
    }
  }
`;

const HomePage = () => {
  const { loading, error, data } = useQuery(GET_FEATURED_AGENTS);
  
  const featuredAgents = data?.agents ? data.agents.slice(0, 6) : [];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 }, // Slightly increased y for more noticeable animation
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15 // Slightly adjusted stagger
      }
    }
  };

  return (
    <>
      <SEO 
        title="PigeonRTC - AI Agent Marketplace | Home"
        description="Discover, integrate, and manage autonomous AI agents. Streamline your business operations with PigeonRTC's curated marketplace of specialized AI solutions."
        keywords="AI agents, artificial intelligence, marketplace, business automation, autonomous agents, PigeonRTC"
        url="https://pigeonrtc.com/"
        image="https://pigeonrtc.com/images/og-homepage.png" // Replace with actual path to a homepage-specific OG image if you have one
      />
      <div className="home-container"> {/* Ensure this class is present if used for scoping in CSS */}
      
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1>Empower Your Business with Intelligent Automation</h1>
            <p className="subtitle">
              PigeonRTC connects you with a curated ecosystem of autonomous AI agents, ready to tackle complex tasks and drive growth.
            </p>
            <div className="cta-buttons">
              <Link to="/agents" className="btn btn-primary">Explore Agents</Link>
              <Link to="/register" className="btn btn-secondary">Join PigeonRTC</Link>
            </div>
          </motion.div>
          <motion.div 
            className="hero-illustration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img src={HeroIllustration} alt="AI Agents enhancing business workflows" />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section - Why Choose PigeonRTC? */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Why Choose PigeonRTC?
          </h2>
          <p className="subtitle">
            We provide the tools and platform for seamless AI integration, empowering both businesses and developers.
          </p>
          
          <motion.div 
            className="features-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="feature-card" variants={fadeInUp}>
              <FaPuzzlePiece className="feature-icon" />
              <h3>Seamless Integration</h3>
              <p>Effortlessly connect AI agents to your existing systems with robust APIs, webhooks, and pre-built connectors.</p>
            </motion.div>
            
            <motion.div className="feature-card curated-marketplace-card" variants={fadeInUp}>
              <FaStore className="feature-icon" />
              <h3>Curated Marketplace</h3>
              <p>Access a diverse range of vetted, high-quality AI agents designed for specific tasks and industries.</p>
            </motion.div>
            
            <motion.div className="feature-card" variants={fadeInUp}>
              <FaUsers className="feature-icon" />
              <h3>Developer-Centric</h3>
              <p>Join a vibrant community. Build, deploy, and monetize your AI agents on a platform built for innovation.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured AI Agents Section */}
      <section className="featured-agents-section">
        <div className="container">
          <h2 className="section-title">Featured AI Agents</h2>
          {loading && <p className="loading-text">Loading agents...</p>}
          {error && <p className="error-text">Error fetching agents. Please try again later.</p>}
          {featuredAgents.length === 0 && !loading && <p className="info-text">No featured agents available at the moment.</p>}
          {featuredAgents.length > 0 && (
            <motion.div 
              className="agents-grid"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {featuredAgents.map(agent => (
                <motion.div key={agent.id} className="agent-card-wrapper" variants={fadeInUp}>
                  <Link to={`/agent/${agent.id}`} className="agent-card">
                    <div className="agent-card-content">
                      <h3>
                        {agent.name}
                        {agent.name.toLowerCase() === 'ripples' && 
                          <span className="agent-demo-indicator">DEMO</span>}
                      </h3>
                      <p className="agent-description">
                        {agent.description || 'No description available.'}
                      </p>
                      {agent.tags?.length > 0 && (
                        <div className="agent-tags">
                          {agent.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="agent-footer">
                      <span className="developer">By {agent.developer?.username || 'PigeonRTC Team'}</span>
                      {agent.pricing?.type === 'FREE' || agent.pricing?.amount === 0 ? (
                        <div className="price-container">
                          <span className="price-free">Free</span>
                        </div>
                      ) : agent.pricing?.amount > 0 ? (
                        <div className="price-container">
                          <span className="price-amount">${agent.pricing.amount.toFixed(2)}</span>
                          {agent.pricing.type === 'SUBSCRIPTION' && (
                            <span className="price-frequency">/month</span>
                          )}
                          {agent.pricing.type === 'ONE_TIME' && (
                            <span className="price-frequency">one-time</span>
                          )}
                           {agent.pricing.type === 'PAY_PER_USE' && (
                            <span className="price-frequency">per use</span>
                          )}
                        </div>
                      ) : (
                        <div className="price-container">
                          <span className="price-free">Contact Us</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="cta-container">
            <Link to="/agents" className="btn btn-outline">View All Agents</Link>
          </div>
        </div>
      </section>

      {/* CTA Section - General Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title">Ready to Revolutionize Your Workflow?</h2>
          <p className="subtitle">Join PigeonRTC today and unlock the power of autonomous AI. Sign up for early access or explore our growing marketplace.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Get Started Now</Link>
            <Link to="/pricing" className="btn btn-secondary">Explore Pricing</Link> {/* Changed from btn-outline for better contrast */}
          </div>
        </div>
      </section>

      {/* Roadmap Section - What's Coming Next */}
      <section className="roadmap-section">
        <div className="container">
          <h2 className="section-title">What's Coming Next at PigeonRTC</h2>
          <p className="section-subtitle">We're dedicated to continuous innovation. Here’s a peek at our exciting future developments.</p>
          
          <div className="roadmap-timeline">
            <motion.div className="timeline-item" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Advanced Agent Customization</h3>
                <p>More granular controls for tailoring agent behavior, personality, and data sources to your specific needs. (Q3 2025)</p>
              </div>
            </motion.div>
            <motion.div className="timeline-item" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Multi-Agent Orchestration</h3>
                <p>Tools to create complex workflows by chaining multiple AI agents together for sophisticated automation. (Q4 2025)</p>
              </div>
            </motion.div>
            <motion.div className="timeline-item" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Expanded Integration Hub</h3>
                <p>A wider array of pre-built integrations for popular business applications, CRMs, and communication platforms. (Q1 2026)</p>
              </div>
            </motion.div>
             <motion.div className="timeline-item" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Community-Driven Features</h3>
                <p>Enhanced forums, feature voting, and direct feedback channels to shape the future of PigeonRTC together. (Ongoing)</p>
              </div>
            </motion.div>
          </div>
          
          {/* Optional: Link to a more detailed roadmap page if it exists */}
          {/* <div className="cta-container">
            <Link to="/roadmap" className="btn btn-outline">View Full Roadmap</Link>
          </div> */}
        </div>
      </section>
    </div>
    </>
  );
};

export default HomePage;
