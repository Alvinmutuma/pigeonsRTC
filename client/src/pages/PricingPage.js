import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaRocket, FaStar, FaCode, FaUsers, FaGem } from 'react-icons/fa';
import './PricingPage.css';
import SEO from '../components/SEO';

const PricingPage = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: 'forever',
      icon: <FaRocket className="plan-icon" />,
      features: [
        'Access to free agents',
        'Community support',
        'Basic documentation',
        'Email support',
        '5 agent interactions/day',
        'Basic analytics'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline',
      popular: false
    },
    {
      name: 'Developer',
      price: '19',
      period: 'per month',
      icon: <FaCode className="plan-icon" />,
      features: [
        'Everything in Starter',
        '50 agent interactions/day',
        'Priority support',
        'API access',
        'Advanced analytics',
        'Webhooks'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary',
      popular: true
    },
    {
      name: 'Team',
      price: '49',
      period: 'per month',
      icon: <FaUsers className="plan-icon" />,
      features: [
        'Everything in Developer',
        'Unlimited agent interactions',
        'Team collaboration',
        'Dedicated support',
        'Custom integrations',
        'Team analytics'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      icon: <FaGem className="plan-icon" />,
      features: [
        'Everything in Team',
        'Unlimited everything',
        'Dedicated account manager',
        'SLA & 24/7 support',
        'On-premises deployment',
        'Custom development'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline',
      popular: false
    }
  ];

  return (
    <>
      <SEO 
        title="Pricing Plans | PigeonRTC - AI Agent Marketplace"
        description="Explore flexible pricing plans for PigeonRTC's AI agent marketplace. Choose the best fit for your business, from free starter plans to enterprise solutions."
        keywords="PigeonRTC pricing, AI agent costs, AI marketplace plans, subscription, enterprise AI, free AI agents"
        url="https://pigeonrtc.com/pricing"
        image="https://pigeonrtc.com/images/og-pricing.png" // Replace with actual path to a pricing-specific OG image
      />
      <div className="pricing-page">
      <div className="pricing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the perfect plan for your needs</p>
      </div>

      <div className="pricing-disclaimer">
        <div className="disclaimer-box">
          <h3>📢 Pricing Model Under Development</h3>
          <p>This pricing model is for informational purposes only and is not yet active. No payment is required during our MVP phase.</p>
          <ul>
            <li>Final pricing may change based on user feedback and feature enhancements</li>
            <li>Early adopters will receive special founding member benefits</li>
            <li>We're focused on delivering value before implementing payments</li>
          </ul>
          <p className="disclaimer-cta">Interested in premium features? <Link to="/contact">Register your interest</Link></p>
        </div>
      </div>

      <div className="pricing-container">
        <div className="pricing-plans">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">
                  <FaStar className="star-icon" /> Most Popular
                </div>
              )}
              <div className="plan-header">
                {plan.icon}
                <h3>{plan.name}</h3>
                <div className="price">
                  {plan.price === '0' ? 'Free' : plan.price === 'Custom' ? 'Custom' : `$${plan.price}`}
                  {plan.period && <span className="period">/{plan.period}</span>}
                </div>
              </div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FaCheck className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-footer">
                <Link 
                  to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`btn btn-${plan.buttonVariant} btn-block`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>Is there a free trial available?</h3>
          <p>Yes, you can try our Pro plan free for 14 days. No credit card required.</p>
        </div>
        <div className="faq-item">
          <h3>Can I change plans later?</h3>
          <p>Absolutely! You can upgrade or downgrade your plan at any time.</p>
        </div>
        <div className="faq-item">
          <h3>What payment methods do you accept?</h3>
          <p>We accept all major credit cards and PayPal. For Enterprise plans, we also accept bank transfers.</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default PricingPage;
