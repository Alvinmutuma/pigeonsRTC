import { gql } from '@apollo/client';

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      id
      rating
      title
      content
      verifiedPurchase
      status
      createdAt
      formattedDate
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: ReviewInput!) {
    updateReview(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const MARK_REVIEW_HELPFUL = gql`
  mutation MarkReviewHelpful($id: ID!, $helpful: Boolean!) {
    markReviewHelpful(id: $id, helpful: $helpful) {
      id
      helpfulVotes
      isHelpful
    }
  }
`;

export const UPDATE_REVIEW_STATUS = gql`
  mutation UpdateReviewStatus($id: ID!, $status: ReviewStatus!) {
    updateReviewStatus(id: $id, status: $status) {
      id
      status
      agent {
        id
        name
      }
    }
  }
`;
