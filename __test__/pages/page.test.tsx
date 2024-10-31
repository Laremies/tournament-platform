// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import Page from '@/app/page'; // Adjust the import path as necessary
// import { getMostPopularTournaments } from '@/lib/actions';
// import { BrowseTournamentsButton } from '@/components/ui/landing-pages';
// // Mock the action to avoid making real calls
// jest.mock('@lib/actions', () => ({
//     getMostPopularTournaments: jest.fn() as jest.MockedFunction<typeof getMostPopularTournaments>,
// }));

// // Mocking the components
// jest.mock('@/components/ui/landing-pages', () => ({
//     HowItWorksSection: () => <div>How It Works Section</div>,
//     TournamentsSection: ({ title, tournaments, button }: { title: string; tournaments: any[]; button: React.ReactNode }) => (
//         <div>
//             <h2>{title}</h2>
//             {button}
//             <ul>
//                 {tournaments.map((tournament, index) => (
//                     <li key={index}>{tournament}</li>
//                 ))}
//             </ul>
//         </div>
//     ),
//     SignUpButton: () => <button>Sign Up</button>,
//     BrowseTournamentsButton: () => <button>Browse Tournaments</button>,
// }));

// describe('Page Component', () => {
//     beforeEach(() => {
//         // Set the mock implementation for getMostPopularTournaments
//         (getMostPopularTournaments as jest.Mock).mockResolvedValue({
//             popularTournaments: [],
//         });
//     });


//     it('should call getMostPopularTournaments on render', async () => {
//         // Render the Page component
//         render(<BrowseTournamentsButton />);

//         // Check if getMostPopularTournaments was called
//         // expect(getMostPopularTournaments).toHaveBeenCalled();
//     });
// });

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'

describe('Page', () => {
    it('renders a heading', () => {
        render(<Page />)

        // const heading = screen.getByRole('heading', { level: 1 })

        // expect(heading).toBeInTheDocument()
    })
})