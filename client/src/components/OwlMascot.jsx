import React from 'react';
import { MentorAvatar } from './MentorAvatar.jsx';

/**
 * Re-export MentorAvatar as OwlMascot for backward compatibility.
 */
export function OwlMascot(props) {
  return <MentorAvatar {...props} />;
}
