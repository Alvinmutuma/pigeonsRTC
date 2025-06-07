import { gql } from '@apollo/client';

// User fragments for consistent data fetching
export const USER_FRAGMENT = gql`
  fragment UserParts on User {
    id
    username
    email
    role
    isVerified
    dashboardPath
    createdAt
    updatedAt
  }
`;

// Register a new user
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      token
      user {
        ...UserParts
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Login a user
export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        ...UserParts
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Resend verification email
export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;

// Verify email with token
export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      token
      user {
        ...UserParts
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Request password reset
export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

// Reset password with token
export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
