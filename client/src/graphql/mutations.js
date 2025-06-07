import { gql } from '@apollo/client';

// Import mutations from separate files
import { UPDATE_USER_SETTINGS } from './mutations/userSettingsMutations';

// Re-export imported mutations
export { UPDATE_USER_SETTINGS };

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        username
        email
        role
        dashboardPath
      }
    }
  }
`;

export const CREATE_FORUM_POST = gql`
  mutation CreateForumPost($input: CreateForumPostInput!) {
    createForumPost(input: $input) {
      id
      title
      content
      category {
        id
        name
      }
      author {
        id
        username
      }
      tags
      createdAt
      upvotes
      commentCount
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
        isVerified # Ensure isVerified is requested
        dashboardPath
      }
    }
  }
`;

export const CREATE_AGENT = gql`
  mutation CreateAgent($input: CreateAgentInput!) {
    createAgent(input: $input) {
      id
      name
      description
      category
      pricing {
        type
        amount
        currency
        details
      }
      status
      developer {
        id
        username
      }
      integrationDetails {
        type
        apiUrl
        instructions
        authentication {
          type
          apiKeyDetails {
            key
            in
            name
          }
          bearerTokenDetails {
            token
          }
        }
      }
      sandbox {
        isEnabled
        testInstructions
      }
    }
  }
`;

export const UPDATE_AGENT_STATUS = gql`
  mutation UpdateAgentStatus($agentId: ID!, $status: AgentStatus!) {
    updateAgentStatus(agentId: $agentId, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_AGENT = gql`
  mutation UpdateAgent($agentId: ID!, $input: UpdateAgentInput!) {
    updateAgent(agentId: $agentId, input: $input) {
      id
      name
      description
      category
      useCases
      status
      pricing {
        type
        amount
        currency
        details
      }
      tags
      customizationGuide
      createdAt
      updatedAt
      developer {
        id
        username
        email
      }
      integrationDetails {
        type
        apiUrl
        instructions
      }
      sandbox {
        isEnabled
        testInstructions
      }
    }
  }
`;

export const EXECUTE_AGENT_SANDBOX_TEST = gql`
  mutation ExecuteAgentSandboxTest($agentId: ID!, $testInput: String!) {
    executeAgentSandboxTest(agentId: $agentId, testInput: $testInput) {
      success
      response # This will be a JSON string
      error
    }
  }
`;

// Community Forum Mutations

// Category Mutations
export const CREATE_FORUM_CATEGORY = gql`
  mutation CreateForumCategory($input: CreateForumCategoryInput!) {
    createForumCategory(input: $input) {
      id
      name
      description
      slug # Added slug
      postCount
      creator {
        id
        username
      }
    }
  }
`;

export const UPDATE_FORUM_CATEGORY = gql`
  mutation UpdateForumCategory($id: ID!, $input: UpdateForumCategoryInput!) {
    updateForumCategory(id: $id, input: $input) {
      id
      name
      description
      postCount
    }
  }
`;

export const DELETE_FORUM_CATEGORY = gql`
  mutation DeleteForumCategory($id: ID!) {
    deleteForumCategory(id: $id) {
      id # Returns the deleted category
    }
  }
`;

// Post Mutations

export const UPDATE_FORUM_POST = gql`
  mutation UpdateForumPost($id: ID!, $input: UpdateForumPostInput!) {
    updateForumPost(id: $id, input: $input) {
      id
      title
      content
      tags
      isPinned
      isLocked
      # Add other fields that can be updated and returned
    }
  }
`;

export const DELETE_FORUM_POST = gql`
  mutation DeleteForumPost($id: ID!) {
    deleteForumPost(id: $id) {
      id
      title
    }
  }
`;

export const UPVOTE_FORUM_POST = gql`
  mutation UpvoteForumPost($id: ID!) {
    upvoteForumPost(id: $id) {
      id
      upvotes
    }
  }
`;

// Comment Mutations
export const CREATE_FORUM_COMMENT = gql`
  mutation CreateForumComment($input: CreateForumCommentInput!) {
    createForumComment(input: $input) {
      id
      content
      author {
        id
        username
      }
      post {
        id # Parent post ID
      }
      upvotes
      createdAt
    }
  }
`;

export const UPDATE_FORUM_COMMENT = gql`
  mutation UpdateForumComment($id: ID!, $input: UpdateForumCommentInput!) {
    updateForumComment(id: $id, input: $input) {
      id
      content
      upvotes
      # Add other fields that can be updated and returned
    }
  }
`;

export const DELETE_FORUM_COMMENT = gql`
  mutation DeleteForumComment($id: ID!) {
    deleteForumComment(id: $id) {
      id # Returns the deleted comment
    }
  }
`;

export const UPVOTE_FORUM_COMMENT = gql`
  mutation UpvoteForumComment($id: ID!) {
    upvoteForumComment(id: $id) {
      id
      upvotes
    }
  }
`;

// Billing and Subscription Mutations
export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($input: PaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      success
      message
      paymentMethod {
        id
        type
        lastFour
        brand
        expiryMonth
        expiryYear
      }
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($input: SubscriptionUpdateInput!) {
    updateSubscription(input: $input) {
      id
      planId
      planName
      status
      startDate
      endDate
      trialEndsAt
      monthlyQuota
      currentUsage
      autoRenew
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      status
      endDate
    }
  }
`;

export const GENERATE_INVOICE = gql`
  mutation GenerateInvoice($month: Int!, $year: Int!) {
    generateInvoice(month: $month, year: $year) {
      id
      invoiceNumber
      amount
      currency
      status
      dueDate
      items {
        description
        amount
        quantity
      }
      pdf
      createdAt
    }
  }
`;

// Interest Email Mutations
export { SEND_INTEREST_EMAIL } from './mutations/interestMutations';

// Profile Mutations
export { UPDATE_USER_PROFILE, CHANGE_PASSWORD } from './mutations/profileMutations';

// Review Mutations
export { CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW, MARK_REVIEW_HELPFUL } from './mutations/reviewMutations';

// Note: SEND_INTEREST_EMAIL is now imported from ./mutations/interestMutations.js
