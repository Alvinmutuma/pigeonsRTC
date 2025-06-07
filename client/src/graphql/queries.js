import { gql } from '@apollo/client';

// Get current authenticated user
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      role
      isVerified
      dashboardPath
      createdAt
      updatedAt
    }
  }
`;

// Define the AgentStatus enum (all lowercase to match GraphQL enum)
export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING_APPROVAL: 'pending_approval',
  REJECTED: 'rejected'
};

export const GET_AGENTS_FOR_DISPLAY = gql`
  query GetAgentsForDisplay(
    $searchTerm: String
    $category: String
    $status: AgentStatus
    $minPrice: Float
    $maxPrice: Float
    $tags: [String]
  ) {
    agents(
      searchTerm: $searchTerm
      category: $category
      status: $status
      minPrice: $minPrice
      maxPrice: $maxPrice
      tags: $tags
    ) {
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
      tags
      status
      developer {
        id
        username
      }
    }
  }
`;

export const GET_AGENT_DETAILS = gql`
  query GetAgentDetails($agentId: ID!) {
    agent(id: $agentId) {
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
        externalDocumentationLink
        authentication {          
          type
          apiKeyDetails {         
            # key # Explicitly DO NOT fetch the actual key for security reasons
            in
            name
          }
          # bearerTokenDetails { # The token itself is sensitive and should not be fetched here.
          #   token # Explicitly DO NOT fetch the actual token for security reasons
          # }
        }
      }
      sandbox {
        isEnabled
        testInstructions
      }
    }
  }
`;

export const GET_MY_AGENTS = gql`
  query GetMyAgents {
    myAgents {
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
      tags
      # Add other fields you might want to display on the 'My Agents' list
    }
  }
`;

export const GET_PENDING_AGENTS = gql`
  query GetPendingAgents {
    pendingAgents {
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
      automatedVettingInfo { # Added for admin dashboard
        apiUrlCheck {
          lastChecked
          status
          httpStatusCode
          details
        }
        docUrlCheck { # Added for documentation URL check
          lastChecked
          status
          httpStatusCode
          details
        }
      }
    }
  }
`;

export const GET_AGENT_SANDBOX_CONFIG = gql`
  query GetAgentSandboxConfig($agentId: ID!) {
    agent(id: $agentId) {
      id
      name
      sandbox {
        isEnabled
        initialPrompt
      }
      integrationDetails {
        type
        apiUrl
        authentication {
          type
          apiKeyDetails {
            key
            name
            in
          }
          bearerTokenDetails {
            token # Be cautious about fetching tokens to the client
          }
        }
      }
    }
  }
`;

// Community Forum Queries

export const GET_FORUM_CATEGORIES = gql`
  query GetForumCategories {
    forumCategories {
      id
      name
      description
      postCount
      # createdAt # Optional: uncomment if you need to display creation date
      # updatedAt # Optional: uncomment if you need to display last update date
    }
  }
`;

export const GET_FORUM_CATEGORY_DETAILS = gql`
  query GetForumCategoryDetails($categoryId: ID!) {
    forumCategory(id: $categoryId) {
      id
      name
      description
    }
  }
`;

export const GET_FORUM_POSTS = gql`
  query GetForumPosts(
    $categoryId: ID
    $authorId: ID
    $tag: String
    $sortBy: ForumPostSortBy
    $limit: Int
    $offset: Int
  ) {
    forumPosts(
      categoryId: $categoryId
      authorId: $authorId
      tag: $tag
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      id
      title
      author {
        id
        username
      }
      category {
        id
        name
      }
      tags
      upvotes
      views
      commentCount
      createdAt
      isPinned
      isLocked
    }
  }
`;

export const GET_FORUM_POSTS_BY_CATEGORY = gql`
  query GetForumPostsByCategory($categoryId: ID!, $limit: Int, $offset: Int) {
    forumPostsByCategory(categoryId: $categoryId, limit: $limit, offset: $offset) {
      posts {
        id
        title
        content # For snippet generation
        author {
          id
          username
        }
        category {
          id
          name
        }
        createdAt
        upvotes
        commentCount
        tags
      }
      totalPosts # For pagination
    }
  }
`;

export const GET_FORUM_POST_DETAILS = gql`
  query GetForumPostDetails($postId: ID!, $commentsLimit: Int, $commentsOffset: Int) {
    forumPost(id: $postId) {
      id
      title
      content
      author {
        id
        username
        # Add other user details if needed, e.g., profile picture
      }
      category {
        id
        name
      }
      tags
      upvotes
      views
      commentCount
      createdAt
      updatedAt
      isPinned
      isLocked
      comments(limit: $commentsLimit, offset: $commentsOffset) {
        comments {
          id
          content
          author {
            id
            username
          }
          upvotes
          createdAt
          updatedAt
          # isEdited - if you add this field
        }
        totalCount
      }
    }
  }
`;

export const GET_FORUM_POSTS_CONNECTION = gql`
  query GetForumPostsConnection(
    $categoryId: String
    $authorId: ID
    $tag: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    forumPosts(
      categoryId: $categoryId
      authorId: $authorId
      tag: $tag
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      posts {
        id
        title
        content # Or a snippet/summary if preferred for list views
        author {
          id
          username
        }
        category {
          id
          name
        }
        tags
        upvotes
        views
        commentCount
        isPinned
        isLocked
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_FORUM_CATEGORY_INFO = gql`
  query GetForumCategoryInfo($identifier: String!) {
    forumCategory(identifier: $identifier) {
      id
      name
      description
      postCount
      slug
      creator {
        id
        username
      }
    }
  }
`;

// Billing and Subscription Queries
export const GET_MY_SUBSCRIPTION = gql`
  query GetMySubscription {
    mySubscription {
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

export const GET_MY_INVOICES = gql`
  query GetMyInvoices($limit: Int, $offset: Int) {
    myInvoices(limit: $limit, offset: $offset) {
      invoices {
        id
        invoiceNumber
        amount
        currency
        status
        dueDate
        paidDate
        items {
          description
          amount
          quantity
        }
        pdf
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_MY_USAGE = gql`
  query GetMyUsage($startDate: String, $endDate: String) {
    myUsage(startDate: $startDate, endDate: $endDate) {
      total
      usageByDay {
        date
        count
      }
      usageByAgent {
        agent {
          id
          name
        }
        count
      }
    }
  }
`;

export const GET_AVAILABLE_PLANS = gql`
  query GetAvailablePlans {
    availablePlans {
      id
      name
      description
      price
      currency
      interval
      features
      limits {
        apiCalls
        agents
        teamMembers
      }
      isPopular
      isBusiness
    }
  }
`;

// Review Queries
export { GET_AGENT_REVIEWS, GET_MY_REVIEWS, GET_USER_REVIEW_FOR_AGENT } from './queries/reviewQueries';
