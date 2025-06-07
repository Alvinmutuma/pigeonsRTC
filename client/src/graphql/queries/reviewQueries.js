import { gql } from '@apollo/client';

export const GET_AGENT_REVIEWS = gql`
  query GetAgentReviews(
    $agentId: ID!
    $sortBy: ReviewSortOption
  ) {
    agentReviews(
      agentId: $agentId
      sortBy: $sortBy
    ) {
      reviews {
        id
        rating
        title
        content
        pros
        cons
        verifiedPurchase
        helpfulVotes
        status
        createdAt
        updatedAt
        formattedDate
        isHelpful
        author {
          id
          username
          avatar
        }
      }
      totalCount
      averageRating
      ratingDistribution {
        rating
        count
        percentage
      }
    }
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    myReviews {
      id
      rating
      title
      content
      pros
      cons
      verifiedPurchase
      helpfulVotes
      status
      formattedDate
      createdAt
      updatedAt
      agent {
        id
        name
      }
    }
  }
`;

export const GET_USER_REVIEW_FOR_AGENT = gql`
  query GetUserReviewForAgent($agentId: ID!) {
    userReviewForAgent(agentId: $agentId) {
      id
      rating
      title
      comment
      useCase
      helpful
      notHelpful
      createdAt
      updatedAt
    }
  }
`;
