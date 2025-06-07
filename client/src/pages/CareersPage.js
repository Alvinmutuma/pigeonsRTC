import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../styles/CareersPage.css';

const CareersPage = () => {
  return (
    <div className="careers-page">
      <SEO 
        title="Careers at PigeonRTC | Join Our Team"
        description="Explore career opportunities at PigeonRTC. Join our team and help shape the future of AI agents for businesses."
        path="/careers"
      />
      
      <div className="careers-container">
        <section className="careers-hero">
          <h1>Careers at PigeonRTC</h1>
          <p className="subtitle">Join us in transforming how businesses work with AI</p>
        </section>
        
        <section className="careers-intro">
          <div className="container">
            <h2>Why Work With Us</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>Meaningful Impact</h3>
                <p>Work on technology that's changing how businesses operate around the world. Your contributions will help thousands of companies become more efficient and innovative.</p>
              </div>
              <div className="benefit-card">
                <h3>Innovation-First Culture</h3>
                <p>We're constantly pushing the boundaries of what's possible with AI. You'll work with cutting-edge technology and be encouraged to experiment and innovate.</p>
              </div>
              <div className="benefit-card">
                <h3>Remote-First</h3>
                <p>Work from anywhere with our distributed team. We believe in hiring the best talent regardless of location and providing the flexibility to work how you work best.</p>
              </div>
              <div className="benefit-card">
                <h3>Growth Opportunities</h3>
                <p>As a rapidly growing startup, we offer countless opportunities to take on new challenges, learn new skills, and advance your career in the direction you choose.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="careers-culture">
          <div className="container">
            <h2>Our Culture</h2>
            <div className="culture-content">
              <div className="culture-image">
                {/* Placeholder for team image */}
                <div className="image-placeholder"></div>
              </div>
              <div className="culture-text">
                <p>At PigeonRTC, we've built a culture centered around collaboration, continuous learning, and work-life balance. We believe that the best ideas come from diverse teams where everyone feels empowered to contribute.</p>
                <p>Our team is passionate about AI and its potential to transform businesses, but we're equally passionate about creating a supportive, inclusive workplace where people enjoy coming to work every day.</p>
                <h3>What We Offer</h3>
                <ul className="benefits-list">
                  <li>Competitive salary and equity packages</li>
                  <li>Flexible remote work policy</li>
                  <li>Comprehensive health, dental, and vision benefits</li>
                  <li>Professional development stipend</li>
                  <li>Home office setup allowance</li>
                  <li>Regular team retreats and meetups</li>
                  <li>Unlimited vacation policy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section className="open-positions">
          <div className="container">
            <h2>Open Positions</h2>
            <div className="departments">
              <div className="department">
                <h3>Engineering</h3>
                <div className="job-listings">
                  <div className="job-card">
                    <h4>Senior Full Stack Engineer</h4>
                    <p className="job-location">Remote</p>
                    <p className="job-description">We're looking for experienced full stack engineers to help build and scale our marketplace platform. You'll work across the entire stack with React, Node.js, GraphQL, and MongoDB.</p>
                    <Link to="#" className="btn btn-outline">View Details</Link>
                  </div>
                  <div className="job-card">
                    <h4>AI/ML Engineer</h4>
                    <p className="job-location">Remote</p>
                    <p className="job-description">Help develop our AI agent integration platform, evaluation systems, and testing frameworks. Experience with modern ML frameworks and LLMs required.</p>
                    <Link to="#" className="btn btn-outline">View Details</Link>
                  </div>
                </div>
              </div>
              
              <div className="department">
                <h3>Product & Design</h3>
                <div className="job-listings">
                  <div className="job-card">
                    <h4>Product Manager</h4>
                    <p className="job-location">Remote</p>
                    <p className="job-description">Drive the product roadmap for our developer platform and marketplace. You'll work closely with engineering, design, and business teams to build features that delight our users.</p>
                    <Link to="#" className="btn btn-outline">View Details</Link>
                  </div>
                  <div className="job-card">
                    <h4>UX/UI Designer</h4>
                    <p className="job-location">Remote</p>
                    <p className="job-description">Create intuitive, beautiful experiences for our web platform. You'll design interfaces that make complex AI interactions simple and delightful for businesses and developers.</p>
                    <Link to="#" className="btn btn-outline">View Details</Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="no-position">
              <h3>Don't see the right position?</h3>
              <p>We're always looking for talented people to join our team. Send us your resume and tell us why you'd be a great fit for PigeonRTC.</p>
              <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CareersPage;
