import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getStatusBadgeVariant } from '../utils/taskHelpers.js';

export const TaskStatus = ({ status }) => {
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status ? status.replace('_', ' ') : 'N/A'}
    </Badge>
  );
};
