import { gql } from '@apollo/client';

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UserSettingsInput!) {
    updateUserSettings(input: $input) {
      success
      message
      settings {
        id
        emailNotifications
        pushNotifications
        marketingEmails
        theme
        reducedAnimations
        compactView
        twoFactorAuth
        sessionTimeout
        language
        timezone
      }
    }
  }
`;
