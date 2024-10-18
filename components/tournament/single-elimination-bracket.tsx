import { SingleEliminationMatch } from '@/app/types/types';
import { getUsername } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useMemo } from 'react';

interface MatchNode {
  match: SingleEliminationMatch;
  matchNumber: number;
  children: MatchNode[];
}

const generateSingleEliminationBracket = (
  matches: SingleEliminationMatch[]
): MatchNode | null => {
  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const rootMatch = matches.reduce((prev, current) =>
    current.round > prev.round ? current : prev
  );

  let matchNumber = matches.length;
  const buildTree = (matchId: string | undefined): MatchNode | null => {
    if (!matchId) return null;

    const match = matchMap.get(matchId);
    if (!match) return null;

    return {
      match,
      matchNumber: matchNumber--,
      children: [
        buildTree(match.home_matchup_id),
        buildTree(match.away_matchup_id),
      ].filter((child): child is MatchNode => child !== null),
    };
  };

  return buildTree(rootMatch.id);
};

const SingleEliminationBracket: React.FC<{
  matches: SingleEliminationMatch[];
}> = ({ matches }) => {
  const bracketStructure = useMemo(
    () => generateSingleEliminationBracket(matches),
    [matches]
  );

  if (!bracketStructure) {
    return <div>Failed to generate tournament structure</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <Matches node={bracketStructure} />
    </div>
  );
};

const Matches: React.FC<{ node: MatchNode }> = ({ node }) => {
  if (node.children.length === 0) {
    return (
      <div className="flex items-start justify-end my-[10px] relative">
        <MatchCard match={node} />
        <div className="absolute w-[25px] h-[2px] right-0 top-1/2 bg-white translate-x-full"></div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row-reverse">
        <div className="relative ml-[50px] flex items-center ">
          <MatchCard match={node} />
          <div className="absolute w-[25px] h-[2px] left-0 top-1/2 bg-white -translate-x-full"></div>
        </div>
        <div className="flex flex-col justify-center">
          {node.children.map((child, index) => (
            <div
              key={child.match.id}
              className="flex items-start justify-end my-[10px] relative"
            >
              <div className="flex flex-row-reverse">
                <Matches node={child} />
              </div>
              <div className="absolute w-[25px] h-[2px] right-0 top-1/2 bg-white translate-x-full"></div>
              <div
                className={`absolute bg-white -right-[25px] h-[calc(50%+22px)] w-[2px] top-1/2 ${index === node.children.length - 1 ? '-translate-y-full' : ''}`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

const MatchCard: React.FC<{ match: MatchNode }> = async ({ match }) => {
  const homePlayer = await getUsername(match.match.home_player_id);
  const awayPlayer = await getUsername(match.match.away_player_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match {match.matchNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>
            {homePlayer.username
              ? homePlayer.username
              : match.children[0]
                ? `Winner of Match ${match.children[0].matchNumber}`
                : 'TBD'}
          </p>
          <p>VS</p>
          <p>
            {awayPlayer.username
              ? awayPlayer.username
              : match.children[1]
                ? `Winner of Match ${match.children[1].matchNumber}`
                : 'TBD'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleEliminationBracket;
