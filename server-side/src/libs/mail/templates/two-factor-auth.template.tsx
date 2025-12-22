import { Body, Heading, Tailwind, Text } from '@react-email/components';
import { Html } from '@react-email/html';
import React from 'react';

interface TwoFactorAuthTemplateProps {
  token: string;
}

export function twoFactorAuthTemplate({ token }: TwoFactorAuthTemplateProps) {
  return (
    <Tailwind>
      <Html>
        <Body className="text-black">
          <Heading>Two factor authentication</Heading>
          <Text>
            Your verification code is: <strong>{token}</strong>
          </Text>
          <Text>
            Please, enter this code in the app to complete the authentication.
          </Text>
          <Text>If you did not request this, please ignore this email.</Text>
        </Body>
      </Html>
    </Tailwind>
  );
}
