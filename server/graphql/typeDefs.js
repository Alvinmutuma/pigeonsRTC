const { gql } = require('apollo-server-express');

// Basic placeholder schema
const typeDefs = gql`
  type Query {
    hello: String
    agents(
      searchTerm: String
      category: String
      status: AgentStatus
      minPrice: Float
      maxPrice: Float
      tags: [String]
    ): [Agent!] # Query to get a list of all agents
    agent(id: ID!): Agent # Query to get a single agent by ID
    me: User # Query to get the currently authenticated user (placeholder for now)
    pendingAgents: [Agent!] # Query for admins to get agents pending approval
    myAgents: [Agent!] # Query for developers to get agents they created
    agentCollaborators(agentId: ID!): [Collaborator!] # Get collaborators for an agent
    agentVersionHistory(agentId: ID!): [VersionHistoryItem!] # Get version history for an agent
    
    # Use Case Library Queries
    useCases(industry: String, businessSize: String, featured: Boolean, status: UseCaseStatus, limit: Int, offset: Int): UseCaseConnection!
    useCase(id: ID!): UseCase
    featuredUseCases(limit: Int): [UseCase!]
    useCasesByAgent(agentId: ID!): [UseCase!]
    
    # Integration Queries
    availableIntegrations: [IntegrationType!]
    integrationDetails(type: IntegrationType!): IntegrationTypeDetails

    forumCategories: [ForumCategory!]!
    forumCategory(identifier: String!): ForumCategory

    forumPosts(categoryId: String, authorId: ID, tag: String, sortBy: String, limit: Int, offset: Int): ForumPostConnection! # Updated for pagination
    forumPost(id: ID!): ForumPost
    
    # Review Queries
    agentReviews(agentId: ID!, sortBy: String, filterBy: String): ReviewConnection!
    myReviews: [Review!]
    userReviewForAgent(agentId: ID!): Review
    pendingReviews: [Review!] # Admin only - returns reviews pending approval
    
    # Billing and Subscription Queries
    mySubscription: UserSubscription
    myInvoices(limit: Int, offset: Int): InvoiceConnection!
    myUsage(startDate: String, endDate: String): UsageData
    availablePlans: [SubscriptionPlan!]!
  }

  type Mutation {
    placeholderMutation(input: String): String 
    resendVerificationEmail(email: String!): Boolean! 
    createAgent(input: CreateAgentInput!): Agent
    updateAgentStatus(agentId: ID!, status: AgentStatus!): Agent # Mutation for admins to update agent status
    updateAgent(agentId: ID!, input: UpdateAgentInput!): Agent # Mutation for developers to update their agent
    
    # Git-style Co-ownership Mutations
    addCollaborator(agentId: ID!, input: CollaboratorInput!): Agent
    updateCollaboratorRole(agentId: ID!, userId: ID!, role: CollaboratorRole!): Agent
    removeCollaborator(agentId: ID!, userId: ID!): Agent
    createAgentVersion(agentId: ID!, input: VersionInput!): VersionHistoryItem
    forkAgent(agentId: ID!, name: String!): Agent
    mergeAgentChanges(sourceAgentId: ID!, targetAgentId: ID!): Agent
    
    # Review Mutations are defined below
    
    # One-click Integration Mutations
    setupIntegration(agentId: ID!, integrationType: IntegrationType!, input: IntegrationSetupInput!): IntegrationResult
    testIntegration(agentId: ID!, integrationType: IntegrationType!): IntegrationTestResult
    removeIntegration(agentId: ID!, integrationType: IntegrationType!): Agent
    
    # Use Case Library Mutations
    createUseCase(input: CreateUseCaseInput!): UseCase
    updateUseCase(id: ID!, input: UpdateUseCaseInput!): UseCase
    deleteUseCase(id: ID!): Boolean
    featureUseCase(id: ID!, featured: Boolean!): UseCase
    linkAgentToUseCase(useCaseId: ID!, agentId: ID!): UseCase
    unlinkAgentFromUseCase(useCaseId: ID!, agentId: ID!): UseCase
    addUseCaseMedia(useCaseId: ID!, input: UseCaseMediaInput!): UseCase

    # User Authentication Mutations
    registerUser(input: RegisterInput!): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
    verifyEmail(token: String!): AuthPayload!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    updateUserProfile(input: UpdateUserProfileInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    executeAgentSandboxTest(input: ExecuteAgentSandboxTestInput!): SandboxTestResult

    createForumCategory(input: CreateForumCategoryInput!): ForumCategory
    updateForumCategory(id: ID!, input: UpdateForumCategoryInput!): ForumCategory
    deleteForumCategory(id: ID!): ForumCategory # Add appropriate response, maybe Boolean or the deleted category

    createForumPost(input: CreateForumPostInput!): ForumPost
    updateForumPost(id: ID!, input: UpdateForumPostInput!): ForumPost
    deleteForumPost(id: ID!): ForumPost # Add appropriate response
    upvoteForumPost(id: ID!): ForumPost # Returns the post with updated upvote count
    downvoteForumPost(id: ID!): ForumPost # Returns the post with updated downvote count

    createForumComment(input: CreateForumCommentInput!): ForumComment
    updateForumComment(id: ID!, input: UpdateForumCommentInput!): ForumComment
    deleteForumComment(id: ID!): ForumComment # Add appropriate response
    upvoteForumComment(id: ID!): ForumComment # Returns the comment with updated upvote count
    downvoteForumComment(id: ID!): ForumComment # Returns the comment with updated downvote count
    
    # Review mutations
    createReview(input: ReviewInput!): Review!
    updateReview(id: ID!, input: ReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    markReviewHelpful(id: ID!, helpful: Boolean!): Review!
    updateReviewStatus(id: ID!, status: ReviewStatus!): Review! # Admin only - approve/reject reviews

    # Billing and Subscription Mutations
    updatePaymentMethod(input: PaymentMethodInput!): PaymentMethodResult!
    updateSubscription(input: UpdateSubscriptionInput!): UserSubscription
    cancelSubscription: UserSubscription
    generateInvoice(month: Int!, year: Int!): Invoice
    
    # Contact and Interest Mutations
    sendInterestEmail(input: InterestEmailInput!): InterestEmailResult!
  }

  # This section is now handled by the ReviewStatus enum defined above

  type Review {
    id: ID!
    agent: Agent!
    author: User!
    rating: Int!
    title: String!
    content: String!
    pros: [String]
    cons: [String]
    verifiedPurchase: Boolean
    helpfulVotes: Int
    helpfulVoters: [ID]
    status: ReviewStatus!
    createdAt: String!
    updatedAt: String!
    formattedDate: String
    isHelpful: Boolean
  }

  type ReviewConnection {
    reviews: [Review!]!
    totalCount: Int!
    averageRating: Float!
    ratingDistribution: [RatingDistribution!]!
  }

  type RatingDistribution {
    rating: Int! # 1-5
    count: Int!
    percentage: Int!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
  }

  input ReviewInput {
    agentId: ID!
    rating: Int!
    title: String!
    content: String! # Main body of the review
    pros: [String!]
    cons: [String!]
    verifiedPurchase: Boolean
    useCase: String # Optional field for which use case the review pertains to
  }

  input ReviewFilterInput {
    minRating: Int
    maxRating: Int
    verifiedPurchase: Boolean
    sortBy: ReviewSortOption
  }

  enum ReviewSortOption {
    NEWEST
    HELPFUL
    HIGHEST_RATING
    LOWEST_RATING
  }

  type Agent {
    id: ID!
    name: String!
    description: String!
    category: String!
    useCases: [String!]
    status: AgentStatus!
    developer: User
    collaborators: [Collaborator!]
    versionControl: VersionControl
    reviewStats: ReviewConnection
    integrationDetails: IntegrationDetails!
    sandbox: Sandbox
    customizationGuide: String
    defaultConfig: String # For storing agent-specific default configurations as a JSON string
    tags: [String!]
    pricing: AgentPricing
    automatedVettingInfo: AutomatedVettingInfoType # New field for vetting info
    createdAt: String # Handled by Mongoose timestamps
    updatedAt: String # Handled by Mongoose timestamps
  }
  
  # Git-style Co-ownership Types
  type Collaborator {
    id: ID!
    user: User!
    role: CollaboratorRole!
    addedAt: String!
  }
  
  enum CollaboratorRole {
    ADMIN
    EDITOR
    VIEWER
  }
  
  type VersionControl {
    currentVersion: String!
    versionHistory: [VersionHistoryItem!]
    isPublic: Boolean!
    forkCount: Int!
    forkedFrom: Agent
  }
  
  type VersionHistoryItem {
    id: ID!
    version: String!
    description: String
    changedBy: User!
    timestamp: String!
    changes: [VersionChange!]
  }
  
  type VersionChange {
    field: String!
    oldValue: String
    newValue: String
  }
  
  input CollaboratorInput {
    userId: ID!
    role: CollaboratorRole!
  }
  
  input VersionInput {
    version: String!
    description: String
    changes: [VersionChangeInput!]
  }
  
  input VersionChangeInput {
    field: String!
    oldValue: String
    newValue: String
  }

  enum AgentStatus {
    active
    inactive
    pending_approval
    rejected
  }

  enum AgentPricingType {
    FREE
    SUBSCRIPTION
    PAY_PER_USE
    CONTACT_SALES
  }

  type AgentPricing {
    type: AgentPricingType!
    amount: Float
    currency: String
    details: String
  }

  input AgentPricingInput {
    type: AgentPricingType!
    amount: Float
    currency: String
    details: String
  }

  # Review Types
  type Review {
    id: ID!
    agent: Agent!
    author: User!
    rating: Int!
    title: String!
    content: String!
    pros: [String]
    cons: [String]
    verifiedPurchase: Boolean
    helpfulVotes: Int
    status: ReviewStatus!
    createdAt: String!
    updatedAt: String!
    formattedDate: String
    isHelpful: Boolean
  }

  type ReviewConnection {
    reviews: [Review!]!
    totalCount: Int!
    averageRating: Float!
    ratingDistribution: [RatingDistribution!]!
  }

  type RatingDistribution {
    rating: Int!
    count: Int!
    percentage: Int!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum ReviewSortOption {
    NEWEST
    HELPFUL
    HIGHEST_RATING
    LOWEST_RATING
  }

  input CreateReviewInput {
    agentId: ID!
    rating: Int!
    title: String!
    content: String!
    pros: [String!]
    cons: [String!]
    verifiedPurchase: Boolean
  }

  type IntegrationDetails {
    type: IntegrationType!
    apiUrl: String
    externalDocumentationLink: String
    instructions: String
    authentication: AgentAuthentication
    oneClickIntegrations: OneClickIntegrations
  }

  enum IntegrationType {
    api
    slack_plugin
    website_widget
    zapier
    hubspot
    notion
    microsoft_teams
    discord
    salesforce
    zendesk
    custom
  }
  
  # One-click Integration Types
  type OneClickIntegrations {
    slack: SlackIntegration
    hubspot: HubspotIntegration
    notion: NotionIntegration
    zapier: ZapierIntegration
    microsoft_teams: TeamsIntegration
    salesforce: SalesforceIntegration
    zendesk: ZendeskIntegration
    custom: CustomIntegration
  }
  
  type SlackIntegration {
    enabled: Boolean!
    installationUrl: String
    configOptions: String # JSON string
  }
  
  type HubspotIntegration {
    enabled: Boolean!
    portalId: String
    configOptions: String # JSON string
  }
  
  type NotionIntegration {
    enabled: Boolean!
    workspaceId: String
    configOptions: String # JSON string
  }
  
  type ZapierIntegration {
    enabled: Boolean!
    webhookUrl: String
    triggerKey: String
    configOptions: String # JSON string
  }
  
  type TeamsIntegration {
    enabled: Boolean!
    appId: String
    configOptions: String # JSON string
  }
  
  type SalesforceIntegration {
    enabled: Boolean!
    callbackUrl: String
    configOptions: String # JSON string
  }
  
  type ZendeskIntegration {
    enabled: Boolean!
    subdomain: String
    configOptions: String # JSON string
  }
  
  type CustomIntegration {
    enabled: Boolean!
    configOptions: String # JSON string
  }
  
  type IntegrationTypeDetails {
    type: IntegrationType!
    name: String!
    description: String!
    setupInstructions: String!
    requiredFields: [String!]!
    optionalFields: [String!]
    documentationUrl: String
  }
  
  type IntegrationResult {
    success: Boolean!
    message: String
    integrationDetails: IntegrationDetails
    error: String
  }
  
  type IntegrationTestResult {
    success: Boolean!
    message: String
    details: String
    error: String
  }
  
  input IntegrationSetupInput {
    slackInput: SlackIntegrationInput
    hubspotInput: HubspotIntegrationInput
    notionInput: NotionIntegrationInput
    zapierInput: ZapierIntegrationInput
    teamsInput: TeamsIntegrationInput
    salesforceInput: SalesforceIntegrationInput
    zendeskInput: ZendeskIntegrationInput
    customInput: CustomIntegrationInput
  }
  
  input SlackIntegrationInput {
    botToken: String!
    signingSecret: String!
    installationUrl: String
    configOptions: String # JSON string
  }
  
  input HubspotIntegrationInput {
    apiKey: String!
    portalId: String!
    configOptions: String # JSON string
  }
  
  input NotionIntegrationInput {
    accessToken: String!
    workspaceId: String!
    configOptions: String # JSON string
  }
  
  input ZapierIntegrationInput {
    webhookUrl: String!
    triggerKey: String
    configOptions: String # JSON string
  }
  
  input TeamsIntegrationInput {
    appId: String!
    appPassword: String!
    configOptions: String # JSON string
  }
  
  input SalesforceIntegrationInput {
    consumerKey: String!
    consumerSecret: String!
    callbackUrl: String!
    configOptions: String # JSON string
  }
  
  input ZendeskIntegrationInput {
    subdomain: String!
    apiToken: String!
    configOptions: String # JSON string
  }
  
  input CustomIntegrationInput {
    configOptions: String! # JSON string
  }

  type Sandbox {
    isEnabled: Boolean
    testInstructions: String
  }

  enum AuthenticationType {
    NONE
    API_KEY
    BEARER_TOKEN
  }

  enum ApiKeyLocation {
    HEADER
    QUERY
  }

  type ApiKeyDetails {
    key: String # Sensitive: consider how this is exposed
    in: ApiKeyLocation
    name: String # Header name or Query param name
  }

  type BearerTokenDetails {
    token: String # Sensitive: consider how this is exposed
  }

  type AgentAuthentication {
    type: AuthenticationType!
    apiKeyDetails: ApiKeyDetails
    bearerTokenDetails: BearerTokenDetails
  }

  input CreateAgentInput {
    name: String!
    description: String!
    category: String!
    useCases: [String!]
    pricing: AgentPricingInput
    integrationDetails: CreateIntegrationDetailsInput!
    sandbox: CreateSandboxInput
    customizationGuide: String
    defaultConfig: String # JSON string for default configurations
    tags: [String!]
  }

  input CreateIntegrationDetailsInput {
    type: IntegrationType!
    apiUrl: String
    externalDocumentationLink: String # New field
    instructions: String
    authentication: CreateAgentAuthenticationInput
  }

  input CreateApiKeyDetailsInput {
    key: String!
    in: ApiKeyLocation!
    name: String!
  }

  input CreateBearerTokenDetailsInput {
    token: String!
  }

  input CreateAgentAuthenticationInput {
    type: AuthenticationType!
    apiKeyDetails: CreateApiKeyDetailsInput
    bearerTokenDetails: CreateBearerTokenDetailsInput
  }

  input CreateSandboxInput {
    isEnabled: Boolean
    testInstructions: String
  }

  input UpdateAgentInput {
    name: String
    description: String
    category: String
    useCases: [String!]
    pricing: AgentPricingInput
    integrationDetails: UpdateIntegrationDetailsInput
    sandbox: UpdateSandboxInput
    customizationGuide: String
    defaultConfig: String # JSON string for default configurations
    tags: [String!]
  }

  input UpdateIntegrationDetailsInput {
    type: IntegrationType
    apiUrl: String
    externalDocumentationLink: String # New field
    instructions: String
    authentication: UpdateAgentAuthenticationInput
  }

  input UpdateApiKeyDetailsInput {
    key: String
    in: ApiKeyLocation
    name: String
  }

  input UpdateBearerTokenDetailsInput {
    token: String
  }

  input UpdateAgentAuthenticationInput {
    type: AuthenticationType
    apiKeyDetails: UpdateApiKeyDetailsInput
    bearerTokenDetails: UpdateBearerTokenDetailsInput
  }

  input UpdateSandboxInput {
    isEnabled: Boolean
    testInstructions: String
  }

  # Enum for HTTP Verbs
  enum HttpVerb {
    POST
    GET
  }

  input ExecuteAgentSandboxTestInput {
    agentId: ID!
    inputData: String # JSON string representing the request body or query params
    method: HttpVerb # Defaults to POST if not provided
  }

  # User Types
  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    isVerified: Boolean!
    bio: String
    company: String
    avatarUrl: String
    dashboardPath: String
    createdAt: String!
    updatedAt: String!
    # Do not expose password, tokens, or security fields
    # agentsDeveloped: [Agent!]
    # subscribedAgents: [Agent!]
  }

  enum UserRole {
    business_user
    developer
    admin
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Input Types for User Authentication
  input RegisterInput {
    username: String!
    email: String!
    password: String!
    role: UserRole # Optional, defaults to 'business_user' in schema
  }
  
  input UpdateUserProfileInput {
    username: String
    bio: String
    company: String
    avatarUrl: String
  }

  input LoginInput {
    email: String! # Or username, depending on login strategy
    password: String!
  }

  type SandboxTestResult {
    success: Boolean!
    response: String # JSON string representing the agent's response
    error: String
  }

  # Enum for the status of an automated check
  enum AutomatedVettingStatusEnum {
    PENDING
    SUCCESS
    FAILURE
    NOT_APPLICABLE
    ERROR
    QUEUED # Added for asynchronous job processing
  }

  type AutomatedVettingInfoType {
    apiUrlCheck: ApiUrlCheckType
    docUrlCheck: ApiUrlCheckType # New field for documentation URL check
  }

  type ApiUrlCheckType {
    lastChecked: String
    status: AutomatedVettingStatusEnum
    httpStatusCode: Int
    details: String
  }

  # --- Forum Feature Types ---
  
  input CreateForumCategoryInput {
    name: String!
    description: String
  }
  
  input UpdateForumCategoryInput {
    name: String
    description: String
  }

  type ForumCategory {
    id: ID!
    name: String!
    description: String
    slug: String! # URL-friendly identifier
    creator: User # The user who created the category
    postCount: Int # To be resolved, counts posts in this category
    createdAt: String!
    updatedAt: String!
    # posts: [ForumPost!] # Could add if direct fetching of posts under category is needed without separate query
  }

  type ForumPostConnection {
    posts: [ForumPost!]!
    totalCount: Int!
  }

  type ForumCommentConnection {
    comments: [ForumComment!]!
    totalCount: Int!
  }

  type ForumPost {
    id: ID!
    title: String!
    content: String! # Consider Markdown/RichText type later
    author: User! # Assumes User type is defined
    category: ForumCategory!
    tags: [String!]
    upvotes: Int!
    upvotedBy: [User] # Users who upvoted
    downvotes: Int # Number of downvotes
    downvotedBy: [User] # Users who downvoted
    views: Int!
    isPinned: Boolean!
    isLocked: Boolean!
    createdAt: String!
    updatedAt: String!
    commentCount: Int # To be resolved, counts comments on this post
    comments(limit: Int, offset: Int): ForumCommentConnection! # Updated for pagination
  }

  type ForumComment {
    id: ID!
    post: ForumPost! # Link back to post, can be resolved
    author: User! # Assumes User type is defined
    content: String!
    upvotes: Int!
    downvotes: Int!
    createdAt: String!
    updatedAt: String!
  }

  # --- Forum Input Types ---

  input CreateForumPostInput {
    title: String!
    content: String!
    categoryId: ID!
    tags: [String!]
  }

  input UpdateForumPostInput {
    title: String
    content: String
    tags: [String!]
    isPinned: Boolean
    isLocked: Boolean
  }

  input CreateForumCommentInput {
    postId: ID!
    content: String!
  }

  input UpdateForumCommentInput {
    content: String
  }
  
  # --- Billing and Subscription Types ---
  
  type UserSubscription {
    id: ID!
    userId: ID!
    planId: String!
    status: SubscriptionStatus!
    currentPeriodStart: String
    currentPeriodEnd: String
    cancelAtPeriodEnd: Boolean
    createdAt: String
    updatedAt: String
  }

  # Database Subscription model type (not GraphQL subscription)
  type Subscription {
    id: ID!
    userId: ID!
    user: User
    planId: String!
    status: SubscriptionStatus!
    currentPeriodStart: String
    currentPeriodEnd: String
    cancelAtPeriodEnd: Boolean
    paymentMethod: PaymentMethod
    createdAt: String
    updatedAt: String
  }

  type SubscriptionPlan {
    id: ID!
    name: String!
    description: String!
    price: Float!
    currency: String!
    interval: String!
    features: [String!]!
    limits: PlanLimits!
    isPopular: Boolean
    isBusiness: Boolean
  }
  
  type PlanLimits {
    apiCalls: Int!
    agents: Int
    teamMembers: Int
  }
  
  type PaymentMethod {
    id: ID
    type: String!
    lastFour: String
    brand: String
    expiryMonth: Int
    expiryYear: Int
  }
  
  type Invoice {
    id: ID!
    invoiceNumber: String!
    user: User!
    amount: Float!
    currency: String!
    status: InvoiceStatus!
    dueDate: String
    paidDate: String
    items: [InvoiceItem!]!
    pdf: String
    createdAt: String!
  }
  
  type InvoiceItem {
    description: String!
    amount: Float!
    quantity: Int!
  }
  
  type InvoiceConnection {
    invoices: [Invoice!]!
    totalCount: Int!
  }
  
  type UsageData {
    total: Int!
    usageByDay: [DailyUsage!]!
    usageByAgent: [AgentUsage!]!
  }
  
  type DailyUsage {
    date: String!
    count: Int!
  }
  
  type AgentUsage {
    agent: Agent!
    count: Int!
  }
  
  type PaymentMethodResult {
    success: Boolean!
    message: String
    paymentMethod: PaymentMethod
  }
  
  enum SubscriptionStatus {
    active
    canceled
    past_due
    trialing
    unpaid
  }
  
  enum InvoiceStatus {
    draft
    open
    paid
    uncollectible
    void
  }
  
  input PaymentMethodInput {
    cardNumber: String!
    expiryMonth: Int!
    expiryYear: Int!
    cvc: String!
    name: String!
    zipCode: String
  }
  
  input UpdateSubscriptionInput {
    planId: String!
    autoRenew: Boolean
  }
  
  # --- Review Types ---

  type Review {
    id: ID!
    agent: Agent!
    user: User!
    rating: Int!
    title: String!
    comment: String!
    useCase: String
    helpful: Int!
    notHelpful: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ReviewConnection {
    reviews: [Review!]!
    totalCount: Int!
  }

  input ReviewInput {
    agentId: ID!
    rating: Int!
    title: String!
    comment: String!
    useCase: String
  }

  # --- Contact and Interest Types ---
  
  input InterestEmailInput {
    name: String!
    email: String!
    company: String
    interest: String!
    message: String!
  }
  
  type InterestEmailResult {
    success: Boolean!
    message: String
  }
  
  # --- Use Case Library Types ---
  
  type UseCase {
    id: ID!
    title: String!
    description: String!
    industry: String!
    businessSize: String!
    challenge: String!
    solution: String!
    results: String!
    metrics: [UseCaseMetric!]
    testimonial: UseCaseTestimonial
    relatedAgents: [Agent!]
    implementationSteps: [ImplementationStep!]
    mediaAssets: [MediaAsset!]
    featured: Boolean!
    tags: [String!]
    status: UseCaseStatus!
    author: User!
    createdAt: String!
    updatedAt: String!
  }
  
  type UseCaseConnection {
    useCases: [UseCase!]!
    totalCount: Int!
  }
  
  type UseCaseMetric {
    name: String!
    value: String!
    improvement: String
  }
  
  type UseCaseTestimonial {
    quote: String!
    author: String!
    position: String
    company: String
  }
  
  type ImplementationStep {
    order: Int!
    title: String!
    description: String!
  }
  
  type MediaAsset {
    id: ID!
    type: MediaType!
    url: String!
    title: String
    description: String
  }
  
  enum MediaType {
    IMAGE
    VIDEO
    DOCUMENT
  }
  
  enum UseCaseStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }
  
  input CreateUseCaseInput {
    title: String!
    description: String!
    industry: String!
    businessSize: String!
    challenge: String!
    solution: String!
    results: String!
    metrics: [UseCaseMetricInput!]
    testimonial: UseCaseTestimonialInput
    relatedAgents: [ID!]
    implementationSteps: [ImplementationStepInput!]
    tags: [String!]
    status: UseCaseStatus
  }
  
  input UpdateUseCaseInput {
    title: String
    description: String
    industry: String
    businessSize: String
    challenge: String
    solution: String
    results: String
    metrics: [UseCaseMetricInput!]
    testimonial: UseCaseTestimonialInput
    relatedAgents: [ID!]
    implementationSteps: [ImplementationStepInput!]
    tags: [String!]
    status: UseCaseStatus
  }
  
  input UseCaseMetricInput {
    name: String!
    value: String!
    improvement: String
  }
  
  input UseCaseTestimonialInput {
    quote: String!
    author: String!
    position: String
    company: String
  }
  
  input ImplementationStepInput {
    order: Int!
    title: String!
    description: String!
  }
  
  input UseCaseMediaInput {
    type: MediaType!
    url: String!
    title: String
    description: String
  }
`;

module.exports = typeDefs;
