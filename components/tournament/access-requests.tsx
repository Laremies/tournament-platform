import { getAccessRequests } from '@/lib/actions';
import AccessRequestList from './access-request-list';

export default async function AccessRequests({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { accessRequests } = await getAccessRequests(tournamentId);

  return (
    <>
      <AccessRequestList requests={accessRequests || []} />
    </>
  );
}
