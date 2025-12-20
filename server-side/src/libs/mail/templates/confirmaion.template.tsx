import { Html } from '@react-email/html';
import { Heading, Body, Text, Link, Tailwind } from '@react-email/components';
import * as React from 'react';

interface ConfirmationTemplateProps {
  domain: string;
  token: string;
}

export function ConfirmationTemplate({
  domain,
  token,
}: ConfirmationTemplateProps) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  return (
    <Tailwind>
      <Html>
        <Body className="text-black">
          <Heading>Confirm your email address</Heading>
          <Text>Please. To confirm your email - push the link.</Text>
          <Link href={confirmLink}>Confirm email</Link>
          <Text>
            The Link is available 1 hour. If you did not request this, please
            ignore this email.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
}
