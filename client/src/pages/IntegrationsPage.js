import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../styles/IntegrationsPage.css';

// Import logos/illustrations for integrations
import SlackLogo from '../assets/integration-slack.svg';
import TeamsLogo from '../assets/integration-teams.svg';
import ZapierLogo from '../assets/integration-zapier.svg';
import APILogo from '../assets/integration-api.svg';
import WebhookLogo from '../assets/integration-webhook.svg';
import SDKLogo from '../assets/integration-sdk.svg';

const IntegrationsPage = () => {
  return (
    <div className="integrations-page">
      <SEO
        title="PigeonRTC Integrations - Connect AI Agents to Your Tools"
        description="Seamlessly integrate PigeonRTC's AI agents with your existing tech stack. Connect to Slack, Teams, Zapier, or use our API, webhooks, and SDK options."
        path="/integrations"
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
      <section className="integrations-hero">
        <div className="container">
          <h1>Integrations</h1>
          <p className="subtitle">
            Connect PigeonRTC's AI agents with your existing tech stack and workflows.
            Our flexible integration options make it easy to deploy AI agents wherever you need them.
          </p>
        </div>
      </section>

      {/* Primary Integrations */}
      <section className="primary-integrations">
        <div className="container">
          <h2>Platform Integrations</h2>
          <p className="section-description">
            Deploy AI agents directly within the tools your team already uses
          </p>

          <div className="integrations-grid">
            {/* Slack */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={SlackLogo} alt="Slack Logo" />
              </div>
              <h3>Slack</h3>
              <p>
                Add AI agents as Slack apps that respond to mentions, commands, or messages in channels.
                Perfect for team collaboration and workflow automation.
              </p>
              <div className="integration-actions">
                <a href="#slack" className="btn btn-outline">Learn More</a>
                <span className="integration-status available">Available</span>
              </div>
            </div>

            {/* Microsoft Teams */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={TeamsLogo} alt="Microsoft Teams Logo" />
              </div>
              <h3>Microsoft Teams</h3>
              <p>
                Integrate AI agents as Teams bots to automate tasks, answer questions, 
                and participate in meetings or chat discussions.
              </p>
              <div className="integration-actions">
                <a href="#teams" className="btn btn-outline">Learn More</a>
                <span className="integration-status available">Available</span>
              </div>
            </div>

            {/* Zapier */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={ZapierLogo} alt="Zapier Logo" />
              </div>
              <h3>Zapier</h3>
              <p>
                Connect AI agents to 5,000+ apps without coding. Create automated workflows
                that trigger AI actions based on events in other tools.
              </p>
              <div className="integration-actions">
                <a href="#zapier" className="btn btn-outline">Learn More</a>
                <span className="integration-status coming-soon">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Options */}
      <section className="developer-integrations">
        <div className="container">
          <h2>Developer Options</h2>
          <p className="section-description">
            Flexible technical integration options for developers and technical teams
          </p>

          <div className="integrations-grid">
            {/* RESTful API */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={APILogo} alt="API Logo" />
              </div>
              <h3>RESTful API</h3>
              <p>
                Comprehensive HTTP API access to all agent functions. Send requests from 
                your applications and receive structured responses in JSON format.
              </p>
              <div className="integration-links">
                <Link to="/docs/api" className="link-with-arrow">Documentation</Link>
                <Link to="/docs/api/examples" className="link-with-arrow">Code Examples</Link>
              </div>
            </div>

            {/* Webhooks */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={WebhookLogo} alt="Webhooks Logo" />
              </div>
              <h3>Webhooks</h3>
              <p>
                Set up event-driven workflows with configurable webhooks. Receive real-time
                notifications when agents complete tasks or need attention.
              </p>
              <div className="integration-links">
                <Link to="/docs/webhooks" className="link-with-arrow">Documentation</Link>
                <Link to="/docs/webhooks/setup" className="link-with-arrow">Setup Guide</Link>
              </div>
            </div>

            {/* SDKs */}
            <div className="integration-card">
              <div className="integration-logo">
                <img src={SDKLogo} alt="SDK Logo" />
              </div>
              <h3>SDKs</h3>
              <p>
                Client libraries for popular programming languages including JavaScript,
                Python, Ruby, and Java to accelerate development.
              </p>
              <div className="integration-links">
                <Link to="/docs/sdk/js" className="link-with-arrow">JavaScript SDK</Link>
                <Link to="/docs/sdk/python" className="link-with-arrow">Python SDK</Link>
                <Link to="/docs/sdk/more" className="link-with-arrow">More Languages</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Integration */}
      <section className="enterprise-integration">
        <div className="container">
          <div className="enterprise-content">
            <h2>Enterprise Integration Support</h2>
            <p>
              Need a custom integration solution? Our enterprise team can create 
              tailored integration solutions for your specific needs, including:
            </p>
            <ul>
              <li>On-premise deployment options</li>
              <li>Custom connectors for proprietary systems</li>
              <li>Single Sign-On (SSO) implementation</li>
              <li>Data residency and compliance solutions</li>
              <li>Dedicated integration support team</li>
            </ul>
            <Link to="/enterprise" className="btn btn-primary">Enterprise Solutions</Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="integrations-cta">
        <div className="container">
          <h2>Ready to integrate AI agents with your systems?</h2>
          <p>Start with our sandbox environment or talk to our integration specialists.</p>
          <div className="cta-buttons">
            <Link to="/docs/getting-started" className="btn btn-primary">Integration Guide</Link>
            <Link to="/contact" className="btn btn-outline">Talk to an Expert</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntegrationsPage;
