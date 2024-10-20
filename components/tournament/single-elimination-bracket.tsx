'use client';
import { SingleEliminationMatch } from '@/app/types/types';
import { useMemo } from 'react';
import { MatchCard } from './match-card';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '../ui/button';

export interface MatchNode {
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

    //spagu taas sry
    if (match.round === 2 && match.home_player_id && match.away_player_id) {
      //both players are bye
      return {
        match,
        matchNumber: matchNumber--,
        children: [
          {
            match: {
              id: 'bye',
              tournament_id: match.tournament_id,
              home_player_id: match.home_player_id,
              away_player_id: match.away_player_id,
              winner_id: match.home_player_id,
              home_matchup_id: undefined,
              away_matchup_id: undefined,
              homePlayerUsername: match.homePlayerUsername,
              awayPlayerUsername: match.awayPlayerUsername,
              round: 1,
            },
            matchNumber: matchNumber--,
            children: [],
          },
          {
            match: {
              id: 'bye',
              tournament_id: match.tournament_id,
              home_player_id: match.home_player_id,
              away_player_id: match.away_player_id,
              winner_id: match.away_player_id,
              home_matchup_id: undefined,
              away_matchup_id: undefined,
              homePlayerUsername: match.homePlayerUsername,
              awayPlayerUsername: match.awayPlayerUsername,
              round: 1,
            },
            matchNumber: matchNumber--,
            children: [],
          },
        ],
      };
    }

    if (match.round === 2 && match.home_player_id) {
      //has a bye player at home
      return {
        match,
        matchNumber: matchNumber--,
        children: [
          {
            match: {
              id: 'bye',
              home_player_id: match.home_player_id,
              away_player_id: match.away_player_id,
              winner_id: match.home_player_id,
              home_matchup_id: undefined,
              away_matchup_id: undefined,
              homePlayerUsername: match.homePlayerUsername,
              awayPlayerUsername: match.awayPlayerUsername,
              round: 1,
            },
            matchNumber: matchNumber--,
            children: [],
          },
          buildTree(match.away_matchup_id),
        ].filter((child): child is MatchNode => child !== null),
      };
    }
    if (match.round === 2 && match.away_player_id) {
      //has a bye player at away
      return {
        match,
        matchNumber: matchNumber--,
        children: [
          buildTree(match.home_matchup_id),
          {
            match: {
              id: 'bye',
              home_player_id: match.home_player_id,
              away_player_id: match.away_player_id,
              winner_id: match.away_player_id,
              home_matchup_id: undefined,
              away_matchup_id: undefined,
              homePlayerUsername: match.homePlayerUsername,
              awayPlayerUsername: match.awayPlayerUsername,
              round: 1,
            },
            matchNumber: matchNumber--,
            children: [],
          },
        ].filter((child): child is MatchNode => child !== null),
      };
    }

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
    <TransformWrapper
      limitToBounds={false}
      minScale={0.5} // Minimum zoom level
      panning={{ velocityDisabled: true }}
    >
      {({ resetTransform }) => (
        <>
          <div className="tools border-b-2 pl-6 pb-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => resetTransform()}
            >
              Reset view
            </Button>
          </div>
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
            }}
            contentStyle={{ width: '100%', height: '100%', padding: '1.5rem' }}
          >
            <Matches node={bracketStructure} isFirstRow={true} />
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
};

const Matches: React.FC<{ node: MatchNode; isFirstRow: boolean }> = ({
  node,
  isFirstRow,
}) => {
  if (node.children.length === 0) {
    return (
      <>
        {isFirstRow && (
          <div className="absolute text-center font-bold -mt-4 left-1/2 transform -translate-x-1/2">
            Round {node.match.round}
          </div>
        )}
        <div className="flex items-start justify-end my-[10px] relative">
          <MatchCard match={node} />
          <div className="absolute w-[25px] h-[2px] right-0 top-1/2 bg-white translate-x-full"></div>
        </div>
      </>
    );
  } else {
    return (
      <div className="flex flex-row-reverse">
        <div className="relative ml-[50px] flex flex-col items-center justify-center">
          <div className="absolute text-center font-bold -mt-40">
            Round {node.match.round} {/* replace with more descriptive name */}
          </div>
          <div className="flex-grow flex items-center justify-center">
            <MatchCard match={node} />
          </div>
          <div className="absolute w-[25px] h-[2px] left-0 top-1/2 bg-white -translate-x-full"></div>
        </div>
        <div className="flex flex-col justify-center">
          {node.children.map((child, index) => (
            <div
              key={child.match.id}
              className="flex items-start justify-end my-[10px] relative"
            >
              <div className="flex flex-row-reverse">
                <Matches node={child} isFirstRow={index === 0} />
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
export default SingleEliminationBracket;
