import { gql } from '@apollo/client';

export const SEND_INTEREST_EMAIL = gql`
  mutation SendInterestEmail($input: InterestEmailInput!) {
    sendInterestEmail(input: $input) {
      success
      message
    }
  }
`;
