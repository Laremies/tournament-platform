import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AccessRequestStatus = 'pending' | 'rejected';

interface AccessRequestStatusProps {
  status: AccessRequestStatus;
}

export default function AccessRequestStatus({
  status,
}: AccessRequestStatusProps) {
  return (
    <Alert
      variant={status === 'pending' ? 'default' : 'destructive'}
      className="w-full max-w-md mx-auto my-10"
    >
      {status === 'pending' ? (
        <Clock className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle className="text-lg font-semibold">
        {status === 'pending'
          ? 'Access Request Pending'
          : 'Access Request Rejected'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {status === 'pending' ? (
          <p>
            Your request to access this tournament is currently under review.
            You will be notified once your request has been approved.
          </p>
        ) : (
          <p>
            Unfortunately, your request to access this tournament has been
            rejected. If you believe this is an error, please contact the
            tournament organizer.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
