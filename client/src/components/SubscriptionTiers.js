import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './SubscriptionTiers.css';

const SubscriptionTiers = () => {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Basic access for all users',
      features: [
        { name: 'Basic agent access', included: true },
        { name: 'Community forum', included: true },
        { name: 'Post/comment', included: true },
        { name: 'Try-before-buy', included: false },
        { name: 'Agent ratings & reviews', included: false },
        { name: 'Integration support', included: false },
      ],
      buttonText: 'Get Started',
      buttonLink: '/register',
      recommended: false,
    },
    {
      name: 'Pro Developer',
      price: '$19',
      period: 'month',
      description: 'For agent creators and developers',
      features: [
        { name: 'Unlimited agent publishing', included: true },
        { name: 'Analytics dashboard', included: true },
        { name: 'Revenue tracking', included: true },
        { name: 'Co-creation tools', included: true },
        { name: 'Priority support', included: true },
        { name: 'API documentation', included: true },
      ],
      buttonText: 'Start Building',
      buttonLink: '/register?role=developer',
      recommended: false,
    },
    {
      name: 'Pro Business',
      price: '$29',
      period: 'month',
      description: 'For businesses using AI agents',
      features: [
        { name: 'Try-before-buy sandbox', included: true },
        { name: 'Agent ratings & reviews', included: true },
        { name: 'One-click integrations', included: true },
        { name: 'Use case library', included: true },
        { name: 'AMA with developers', included: true },
        { name: 'Priority support', included: true },
      ],
      buttonText: 'Upgrade Now',
      buttonLink: '/pricing/business',
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        { name: 'White-label platform', included: true },
        { name: 'SSO integration', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'SLA guarantees', included: true },
        { name: 'On-premise options', included: true },
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
      recommended: false,
    },
  ];

  return (
    <div className="subscription-tiers">
      <div className="tiers-container">
        {tiers.map((tier, index) => (
          <div 
            key={index} 
            className={`tier-card ${tier.recommended ? 'recommended' : ''}`}
          >
            {tier.recommended && <div className="recommended-badge">Recommended</div>}
            <div className="tier-header">
              <h3 className="tier-name">{tier.name}</h3>
              <div className="tier-price">
                <span className="price">{tier.price}</span>
                {tier.period && <span className="period">/{tier.period}</span>}
              </div>
              <p className="tier-description">{tier.description}</p>
            </div>
            <div className="tier-features">
              {tier.features.map((feature, fIndex) => (
                <div key={fIndex} className="feature">
                  {feature.included ? 
                    <FaCheckCircle className="feature-icon included" /> : 
                    <FaTimesCircle className="feature-icon not-included" />
                  }
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
            <div className="tier-footer">
              <Link to={tier.buttonLink} className="tier-button">
                {tier.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTiers;
