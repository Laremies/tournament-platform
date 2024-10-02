import Link from 'next/link';
import { Button } from './button';
import { Search, LogIn } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const BrowseTournamentsButton = () => (
  <Link href="/tournaments">
    <Button size="lg">
      <Search className="mr-2 h-4 w-4" /> Browse Other Tournaments
    </Button>
  </Link>
);

const SignUpButton = () => (
  <Link href="/sign-up">
    <Button size="lg">
      <LogIn className="mr-2 h-4 w-4" /> Sign Up
    </Button>
  </Link>
);

const HowItWorksSection = () => (
  <section className=" py-20 text-center">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            1
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
          <p className="text-muted-foreground">
            Create your account and set up your player profile.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            2
          </div>
          <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
          <p className="text-muted-foreground">
            Start your own tournament or browse and join existing ones.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            3
          </div>
          <h3 className="text-xl font-semibold mb-2">Compete</h3>
          <p className="text-muted-foreground">
            Play matches, track results, and climb the rankings.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// TODO: make separate tournament card component
const PopularTournaments = () => (
  <section className="bg-gradient-to-b from-background to-muted py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Popular Tournaments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Lorem Ipsum</CardTitle>
            <CardDescription>Online | 128 Players</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lorem Ipsum</CardTitle>
            <CardDescription>New York City | 16 Players</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lorem Ipsum</CardTitle>
            <CardDescription>Online | 64 Players</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center mt-8">
        <BrowseTournamentsButton />
      </div>
    </div>
  </section>
);

export {
  BrowseTournamentsButton,
  HowItWorksSection,
  PopularTournaments,
  SignUpButton,
};
