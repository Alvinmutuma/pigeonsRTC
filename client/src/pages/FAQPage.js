import React from 'react';
import SEO from '../components/SEO';
import './FAQPage.css'; // We'll create this CSS file next

const FAQPage = () => {
  const faqs = [
    {
      question: "What is PigeonRTC?",
      answer: "PigeonRTC is an AI Agent Marketplace connecting businesses with autonomous AI agents to automate tasks and enhance productivity. We focus on providing specialized, interactive, and customizable AI solutions."
    },
    {
      question: "How do AI agents differ from AI tools?",
      answer: "AI agents are designed to be autonomous and perform tasks proactively, often interacting with other systems or users. AI tools typically assist users in performing tasks. PigeonRTC agents are action-oriented rather than just assistive."
    },
    {
      question: "What kind of agents can I find on PigeonRTC?",
      answer: "You can find a variety of agents for tasks like customer support automation, data entry and analysis, content generation, social media management, and more. Developers are continuously adding new agents with diverse capabilities."
    },
    {
      question: "How can I integrate an agent into my business?",
      answer: "Agents on PigeonRTC can be integrated via API, Slack, or other supported platforms. Each agent's detail page provides specific integration instructions and options."
    },
    {
      question: "Can I test an agent before committing?",
      answer: "Yes, many agents offer a sandbox environment where you can test their functionality with sample data or your own inputs to see how they perform."
    },
    {
      question: "What are the pricing models for agents?",
      answer: "Pricing varies by agent and can include usage-based billing, monthly subscriptions, or one-time purchases. Detailed pricing information is available on each agent's page."
    },
    {
      question: "How are agents on PigeonRTC vetted for quality and security?",
      answer: "We have a vetting process that includes manual reviews and automated checks to ensure agents meet our quality and security standards before they are listed on the marketplace."
    },
    {
      question: "I'm a developer. How can I list my AI agent on PigeonRTC?",
      answer: "Developers can register on our platform and submit their agents for review. We provide resources and guidelines to help you prepare your agent for the marketplace. Visit our 'Create Agent' page for more details."
    }
  ];

  return (
    <>
      <SEO
        title="FAQ - PigeonRTC | Frequently Asked Questions"
        description="Find answers to common questions about PigeonRTC, our AI agents, integration, pricing, and how to get started with our AI marketplace."
        keywords="PigeonRTC FAQ, AI agent questions, AI marketplace help, frequently asked questions AI"
        url="https://pigeonrtc.com/faq"
        image="https://pigeonrtc.com/images/og-faq.png" // Placeholder for FAQ OG image
      />
      <div className="faq-page">
        <div className="faq-container">
          <div className="faq-header">
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about PigeonRTC.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="faq-contact-prompt">
            <h2>Still have questions?</h2>
            <p>If you can't find the answer you're looking for, feel free to reach out to our support team.</p>
            <a href="/contact" className="btn btn-primary">Contact Us</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
