import { getPublicMessages } from '@/lib/actions';
import { ChatBox } from './chatbox';

export default async function ChatComponent({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { messages } = await getPublicMessages(tournamentId);

  return (
    <div>
      <ChatBox initMessages={messages || []} tournamentId={tournamentId} />
    </div>
  );
}
