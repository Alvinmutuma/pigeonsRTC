import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <SEO 
        title="About PigeonRTC | AI Agents Marketplace"
        description="Learn about PigeonRTC, our mission, values, and the team behind the leading AI agents marketplace."
        path="/about"
      />
      
      <div className="about-container">
        <section className="about-hero">
          <h1>About PigeonRTC</h1>
          <p className="subtitle">Building the future of business automation through AI agents</p>
        </section>
        
        <section className="about-mission">
          <div className="container">
            <h2>Our Mission</h2>
            <div className="mission-content">
              <div className="mission-text">
                <p>At PigeonRTC, we're on a mission to democratize access to advanced AI technologies for businesses of all sizes. We believe that the power of autonomous AI agents should be accessible to everyone, not just tech giants with massive resources.</p>
                <p>Our platform connects businesses with specialized AI solutions that work autonomously to streamline operations, increase efficiency, and unlock new possibilities. We're building a future where AI becomes a natural extension of every business's capabilities.</p>
              </div>
              <div className="mission-values">
                <h3 className="values-heading">Our Values</h3>
                <ul className="values-list">
                  <li><span className="value-name">Innovation</span>: We push the boundaries of what's possible</li>
                  <li><span className="value-name">Accessibility</span>: We make advanced technology available to all</li>
                  <li><span className="value-name">Quality</span>: We curate only the best AI agents</li>
                  <li><span className="value-name">Security</span>: We prioritize data protection and privacy</li>
                  <li><span className="value-name">Collaboration</span>: We foster a thriving community of developers and businesses</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-story">
          <div className="container">
            <h2>Our Story</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">January 2025</div>
                <div className="timeline-content">
                  <h3>The Beginning</h3>
                  <p>PigeonRTC was founded by a team of AI researchers and business strategists who recognized the potential of autonomous AI agents to transform how businesses operate.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">March 2025</div>
                <div className="timeline-content">
                  <h3>First Platform Release</h3>
                  <p>We launched our beta platform with a curated selection of 20 AI agents, focusing on quality and real business impact.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">June 2025</div>
                <div className="timeline-content">
                  <h3>Rapid Growth</h3>
                  <p>Our marketplace expanded to include over 100 specialized AI agents and thousands of business users. We introduced multi-agent workflows and advanced customization options.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Today</div>
                <div className="timeline-content">
                  <h3>Leading the AI Revolution</h3>
                  <p>PigeonRTC is now the fastest-growing marketplace for autonomous AI agents, with a thriving community of developers and businesses collaborating to build the future of work.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-team">
          <div className="container">
            <h2>Our Leadership Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="team-avatar">CEO</div>
                <h3 className="role-title">Chief Executive Officer</h3>
                <p className="team-role">Co-founder</p>
                <p className="team-bio">Former AI research lead at Tech University with 15+ years experience in machine learning and business strategy.</p>
              </div>
              <div className="team-member">
                <div className="team-avatar">CTO</div>
                <h3 className="role-title">Chief Technology Officer</h3>
                <p className="team-role">Co-founder</p>
                <p className="team-bio">Built multiple successful developer platforms and led engineering teams at leading tech companies.</p>
              </div>
              <div className="team-member">
                <div className="team-avatar">CPO</div>
                <h3 className="role-title">Chief Product Officer</h3>
                <p className="team-role">Leadership Team</p>
                <p className="team-bio">Product strategist specializing in AI-powered business solutions with a focus on user experience.</p>
              </div>
              <div className="team-member">
                <div className="team-avatar">CDO</div>
                <h3 className="role-title">Chief Developer Officer</h3>
                <p className="team-role">Leadership Team</p>
                <p className="team-bio">Passionate about building developer communities and fostering innovation in AI technology.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="cta-section">
          <div className="container">
            <h2>Join Us on Our Journey</h2>
            <p>We're just getting started, and we'd love for you to be part of our story.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/careers" className="btn btn-outline">Join Our Team</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
