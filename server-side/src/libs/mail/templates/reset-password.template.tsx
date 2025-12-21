import { Heading, Link, Tailwind, Text, Body } from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

interface ResetPasswordTemplateProps {
  domaine: string;
  token: string;
}

export function ResetPasswordTemplate({
  domaine,
  token,
}: ResetPasswordTemplateProps) {
  const resetLink = `${domaine}/auth/new-password?token=${token}`;

  return (
    <Tailwind>
      <Html>
        <Body className="text-black">
          <Heading>Reset your password</Heading>
          <Text>Please. To reset your password - push the link.</Text>
          <Link href={resetLink}></Link>
          <Text>
            The Link is available 1 hour. If you did not request this, please
            ignore this email.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
}
