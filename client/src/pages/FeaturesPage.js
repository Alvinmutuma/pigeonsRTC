import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../styles/FeaturesPage.css';

// Import any illustrations you might need
import Feature1Illustration from '../assets/feature1-illustration.svg'; // Was feature-a-illustration.svg
import Feature2Illustration from '../assets/feature2-illustration.svg'; // Was feature-b-illustration.svg
import Feature3Illustration from '../assets/feature3-illustration.svg'; // Was feature-c-illustration.svg
import FeatureDIllustration from '../assets/feature-d-illustration.svg';

const FeaturesPage = () => {
  return (
    <div className="features-page">
      <SEO
        title="PigeonRTC Features - AI Agent Capabilities"
        description="Discover the powerful features of PigeonRTC's AI agent marketplace. From smart integrations to autonomous workflows, explore how our platform can transform your business."
        path="/features"
      />

      {/* Disclaimer Banner */}
      <section className="disclaimer-banner">
        <div className="container">
          <div className="disclaimer-content">
            <strong>Development Notice:</strong> The features and integrations described on this page are part of our ongoing development roadmap. We are progressively rolling out these capabilities and appreciate your understanding as we work to enhance our platform.
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="features-hero">
        <div className="container">
          <h1>Platform Features</h1>
          <p className="subtitle">
            Discover the powerful capabilities that make PigeonRTC the leading marketplace for autonomous AI agents.
          </p>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="main-features">
        <div className="container">
          <div className="feature-grid">
            {/* Feature 1: AI Agent Discovery */}
            <div className="feature-card">
              <div className="feature-icon">
                <img src={Feature1Illustration} alt="AI Agent Discovery" />
              </div>
              <div className="feature-content">
                <h2>AI Agent Discovery</h2>
                <p>
                  Browse our curated marketplace of specialized AI agents, filtered by industry, task type, or integration needs.
                  Each agent comes with detailed specifications, use cases, and performance metrics.
                </p>
                <ul className="feature-list">
                  <li>Advanced search and filtering</li>
                  <li>Categorized by industry and function</li>
                  <li>Detailed agent profiles with capabilities and limitations</li>
                  <li>User reviews and ratings</li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Sandbox Testing */}
            <div className="feature-card">
              <div className="feature-content">
                <h2>Sandbox Testing</h2>
                <p>
                  Test any agent in our secure sandbox environment before committing to integration.
                  Validate functionality, data handling, and performance with your specific use cases.
                </p>
                <ul className="feature-list">
                  <li>Risk-free trial environment</li>
                  <li>Custom input testing</li>
                  <li>Performance metrics and response time analysis</li>
                  <li>Data handling validation</li>
                </ul>
              </div>
              <div className="feature-icon">
                <img src={Feature2Illustration} alt="Sandbox Testing" />
              </div>
            </div>

            {/* Feature 3: Seamless Integration */}
            <div className="feature-card">
              <div className="feature-icon">
                <img src={Feature3Illustration} alt="Seamless Integration" />
              </div>
              <div className="feature-content">
                <h2>Seamless Integration</h2>
                <p>
                  Connect agents to your existing tools and workflows with minimal developer effort.
                  Our platform supports multiple integration methods to suit your technical requirements.
                </p>
                <ul className="feature-list">
                  <li>RESTful API endpoints</li>
                  <li>Webhooks for event-driven architectures</li>
                  <li>Popular platform plugins (Slack, Teams, etc.)</li>
                  <li>SDKs for major programming languages</li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Agent Customization */}
            <div className="feature-card">
              <div className="feature-content">
                <h2>Agent Customization</h2>
                <p>
                  Tailor agents to match your brand voice, data requirements, and business rules.
                  Customize behavior without sacrificing the underlying AI capabilities.
                </p>
                <ul className="feature-list">
                  <li>Tone and communication style adjustment</li>
                  <li>Custom data source integration</li>
                  <li>Business rule configuration</li>
                  <li>Response format customization</li>
                </ul>
              </div>
              <div className="feature-icon">
                <img src={FeatureDIllustration} alt="Agent Customization" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="additional-features">
        <div className="container">
          <h2>More Powerful Capabilities</h2>
          <div className="additional-features-grid">
            <div className="additional-feature">
              <h3>Enterprise Security</h3>
              <p>Bank-level encryption, SOC 2 compliance, and advanced access controls to protect your sensitive data.</p>
            </div>
            <div className="additional-feature">
              <h3>Analytics Dashboard</h3>
              <p>Track agent performance, usage patterns, and ROI with our comprehensive analytics tools.</p>
            </div>
            <div className="additional-feature">
              <h3>Multi-Agent Workflows</h3>
              <p>Create complex automation sequences by chaining multiple agents together in custom workflows.</p>
            </div>
            <div className="additional-feature">
              <h3>Developer Portal</h3>
              <p>Access documentation, SDKs, and developer tools to extend and customize the platform.</p>
            </div>
            <div className="additional-feature">
              <h3>Versioning Control</h3>
              <p>Deploy new agent versions without disrupting existing workflows with our version control system.</p>
            </div>
            <div className="additional-feature">
              <h3>Compliance Tools</h3>
              <p>Features to help maintain regulatory compliance across different industries and regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="features-cta">
        <div className="container">
          <h2>Ready to transform your business with AI?</h2>
          <p>Start exploring our marketplace or talk to our team about your specific needs.</p>
          <div className="cta-buttons">
            <Link to="/agents" className="btn btn-primary">Browse Agents</Link>
            <Link to="/register" className="btn btn-secondary">Sign Up Free</Link>
            <Link to="/contact" className="btn btn-outline">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
