import {
  signUpAction,
  forgotPasswordAction,
  signInAction,
  signOutAction,
  getAuthUser,
  submitTournament,
  getTournamentById,
  getUserTournaments,
  getAllUserCurrentTournaments,
  kickPlayer,
  submitMatchResult,
  getTournamentFinalMatch,
} from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Mock the createClient and its auth.signUp method
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/utils/utils', () => ({
  encodedRedirect: jest.fn(),
}));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

//SignUp test
describe('signUpAction', () => {
  const mockSignUp = jest.fn(); // Mock function for signUp
  let supabase: any; // Type assertion for Supabase client

  beforeEach(() => {
    supabase = {
      auth: {
        signUp: mockSignUp,
      },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
    (headers as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should return error if email or password is missing', async () => {
    const formData = new FormData();
    formData.append('username', 'testuser');

    const result = await signUpAction(formData);

    expect(result).toEqual({ error: 'Email and password are required' });
  });

  it('should return encoded redirect on successful sign up', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null }); // Successful sign-up mock response

    const formData = new FormData();
    formData.append('username', 'testuser');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await signUpAction(formData);

    expect(result).toEqual(
      encodedRedirect(
        'success',
        '/sign-up',
        'Thanks for signing up! Please check your email for a verification link.'
      )
    );
  });

  it('should return encoded redirect on sign up error', async () => {
    const error = { code: 'AuthInvalidEmail', message: 'Invalid email' };
    mockSignUp.mockResolvedValueOnce({ error }); // Mocking sign-up error response

    const formData = new FormData();
    formData.append('username', 'testuser');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await signUpAction(formData);

    expect(result).toEqual(encodedRedirect('error', '/sign-up', error.message));
  });
});
//SignIn Test
describe('signInAction', () => {
  const mockSignInWithPassword = jest.fn();
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: { signInWithPassword: mockSignInWithPassword },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => jest.clearAllMocks());

  it('redirects to /home on successful sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    await signInAction(formData);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(redirect).toHaveBeenCalledWith('/home');
  });

  it('redirects to /sign-in with an error on sign-in failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    await signInAction(formData);

    expect(mockSignInWithPassword).toHaveBeenCalled();
    expect(encodedRedirect).toHaveBeenCalledWith(
      'error',
      '/sign-in',
      'Invalid credentials'
    );
  });
});
//Forgot Password test
describe('forgotPasswordAction', () => {
  const mockResetPasswordForEmail = jest.fn();
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: { resetPasswordForEmail: mockResetPasswordForEmail },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
    (headers as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('redirects to success page on successful password reset', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    await forgotPasswordAction(formData);

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo:
        'http://localhost:3000/auth/callback?redirect_to=/protected/reset-password',
    });
    expect(encodedRedirect).toHaveBeenCalledWith(
      'success',
      '/forgot-password',
      'Check your email for a link to reset your password.'
    );
  });

  it('returns an error if email is not provided', async () => {
    const formData = new FormData(); // No email appended

    await forgotPasswordAction(formData);

    expect(encodedRedirect).toHaveBeenCalledWith(
      'error',
      '/forgot-password',
      'Email is required'
    );
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('handles resetPasswordForEmail error properly', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'User not found' },
    });

    const formData = new FormData();
    formData.append('email', 'invalid@example.com');

    await forgotPasswordAction(formData);

    expect(mockResetPasswordForEmail).toHaveBeenCalled();
    expect(encodedRedirect).toHaveBeenCalledWith(
      'error',
      '/forgot-password',
      'Could not reset password'
    );
  });
});

//Signintest
describe('signOutAction', () => {
  const mockSignOut = jest.fn();
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: { signOut: mockSignOut },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => jest.clearAllMocks());

  it('signs out and redirects to /sign-in', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOutAction();

    expect(mockSignOut).toHaveBeenCalled(); // Ensure signOut is called
    expect(redirect).toHaveBeenCalledWith('/sign-in'); // Ensure redirection
  });

  it('handles errors during sign-out gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign-out failed'));

    await expect(signOutAction()).rejects.toThrow('Sign-out failed');

    expect(mockSignOut).toHaveBeenCalled(); // Ensure signOut attempted
    expect(redirect).not.toHaveBeenCalled(); // Should not redirect on failure
  });
});

//SignoutTest
describe('signOutAction', () => {
  const mockSignOut = jest.fn();
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: { signOut: mockSignOut },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => jest.clearAllMocks());

  it('signs out and redirects to /sign-in', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await signOutAction();

    expect(mockSignOut).toHaveBeenCalled(); // Ensure signOut is called
    expect(redirect).toHaveBeenCalledWith('/sign-in'); // Ensure redirection
  });

  it('handles errors during sign-out gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign-out failed'));

    await expect(signOutAction()).rejects.toThrow('Sign-out failed');

    expect(mockSignOut).toHaveBeenCalled(); // Ensure signOut attempted
    expect(redirect).not.toHaveBeenCalled(); // Should not redirect on failure
  });
});

//GetauthUser test
describe('getAuthUser', () => {
  const mockGetUser = jest.fn();

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: mockGetUser },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('returns the authenticated user', async () => {
    const userData = { id: 'user123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: userData }, error: null });

    const result = await getAuthUser();
    expect(mockGetUser).toHaveBeenCalled();
    expect(result).toEqual(userData);
  });

  it('returns null if no user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await getAuthUser();
    expect(result).toBeNull();
  });
});

//Submit Tournament test
describe('submitTournament', () => {
  const mockInsert = jest.fn();
  const mockGetUser = jest.fn();

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: mockGetUser },
      from: jest.fn().mockReturnValue({ insert: mockInsert }),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('submits a tournament successfully', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Tournament');
    formData.append('description', 'Test Description');
    formData.append('maxPlayers', '8');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockInsert.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 'tourn123' }],
        error: null,
      }),
    });

    const result = await submitTournament(formData);

    expect(mockInsert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/home');
    expect(result).toEqual({ success: true, tournamentId: 'tourn123' });
  });

  it('returns an error if the user is not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const formData = new FormData();
    const result = await submitTournament(formData);

    expect(result).toEqual({
      error: 'You must be logged in to create a tournament',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

//Get TourbyId test
describe('getTournamentById', () => {
  const mockSelect = jest.fn();

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('fetches tournament data by ID successfully', async () => {
    const tournamentData = { id: 'tourn123', name: 'Test Tournament' };
    mockSelect.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: tournamentData, error: null }),
      }),
    });

    const result = await getTournamentById('tourn123');
    expect(mockSelect).toHaveBeenCalled();
    expect(result).toEqual({ tournament: tournamentData });
  });

  it('handles tournament not found', async () => {
    mockSelect.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
      }),
    });

    const result = await getTournamentById('invalid_id');
    expect(result).toEqual({ error: 'Tournament not found' });
  });
});

//GetUserTour test
describe('getUserTournaments', () => {
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockOrder = jest.fn();
  const mockGetUser = jest.fn();

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: mockGetUser },
      from: mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              data: null, // Default data, override per test
              error: null, // Default no error, override per test
            }),
          }),
        }),
      }),
    });
    jest.clearAllMocks();
  });

  it('returns tournaments successfully', async () => {
    // Mock the authenticated user
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

    // Mock "tournaments" data
    mockOrder.mockResolvedValueOnce({
      data: [{ id: 'tourn1', name: 'My Tournament' }],
      error: null,
    });

    // Mock "tournamentUsers" data
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          tournaments: [{ id: 'tourn2', name: 'Joined Tournament' }],
        },
      ],
      error: null,
    });

    const result = await getUserTournaments();

    // Assertions for own tournaments
    expect(mockFrom).toHaveBeenCalledWith('tournaments');
    expect(mockSelect).toHaveBeenCalledWith('name, id');
    expect(mockEq).toHaveBeenCalledWith('creator_id', 'user123');

    // Assertions for joined tournaments
    expect(mockFrom).toHaveBeenCalledWith('tournamentUsers');
    expect(mockSelect).toHaveBeenCalledWith('tournaments(name, id)');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');

    // Final result assertion
    expect(result).toEqual({
      ownTournaments: [{ id: 'tourn1', name: 'My Tournament' }],
      joinedTournaments: [{ id: 'tourn2', name: 'Joined Tournament' }],
    });
  });

  it('handles errors during tournament retrieval', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

    mockOrder.mockResolvedValueOnce({ data: null, error: 'Database error' });

    const result = await getUserTournaments();

    expect(result).toEqual({ error: 'Failed to fetch all tournaments' });
  });

  it('returns an error if the user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await getUserTournaments();

    expect(result).toEqual({
      error: 'You must be logged in to view your tournaments',
    });
    expect(mockFrom).not.toHaveBeenCalled(); // Ensure no DB queries are made
    //console.log(result)
  });
});

//KickPlayer test
describe('kickPlayer', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      delete: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      eq1: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully kick a player and update the player count', async () => {
    // Mock the database operations
    mockSupabase.from.mockImplementation((table: any) => {
      if (table === 'tournamentUsers') {
        return {
          delete: () => ({
            eq: () => ({
              eq: jest.fn().mockResolvedValueOnce({ error: null }),
            }),
          }),
        };
      }
      if (table === 'tournaments') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValueOnce({
                data: { player_count: 10 },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              mockResolvedValueOnce: jest
                .fn()
                .mockResolvedValueOnce({ error: null }),
            }),
          }),
        };
      }
    });

    const result = await kickPlayer('tournament-123', 'user-456');

    // Validate expected calls and result
    expect(mockSupabase.from).toHaveBeenCalledWith('tournamentUsers');
    expect(mockSupabase.from).toHaveBeenCalledWith('tournaments');
    expect(revalidatePath).toHaveBeenCalledWith('/tournaments/tournament-123');
    expect(result).toEqual({ success: true });
  });

  it('should handle errors when deleting a user', async () => {
    mockSupabase.from.mockImplementation((table: any) => {
      if (table === 'tournamentUsers') {
        return {
          delete: () => ({
            eq: () => ({
              eq: jest.fn().mockResolvedValueOnce({ error: 'Delete error' }),
            }),
          }),
        };
      }
      if (table === 'tournaments') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValueOnce({
                data: { player_count: 10 },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              mockResolvedValueOnce: jest
                .fn()
                .mockResolvedValueOnce({ error: null }),
            }),
          }),
        };
      }
    });

    const result = await kickPlayer('tournament-123', 'user-456');

    expect(result).toEqual({ error: 'Error kicking player' });
    // expect(console.error).toHaveBeenCalledWith("Delete error");
    console.log(result);
  });

  it("should handle errors when can't update user", async () => {
    mockSupabase.from.mockImplementation((table: any) => {
      if (table === 'tournamentUsers') {
        return {
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          })),
        };
      }
      if (table === 'tournaments') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { player_count: 10 },
                  error: null,
                })
              ),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({ error: 'Error updating player count' })
            ),
          })),
        };
      }
      return mockSupabase; // Default fallback for other tables if needed
    });

    const result = await kickPlayer('tournament-123', 'user-456');

    expect(result).toEqual({ error: 'Error updating player count' });
    console.log(result);
  });
});

describe('getTournamentFinalMatch', () => {
  let mockSupabase: any;
  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { id: 'final-match-123', round: 5 },
                    error: null,
                  })
                ),
              })),
            })),
          })),
        })),
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  it('should return the final match when data is retrieved successfully', async () => {
    // Mock chain for `select`, `eq`, `order`, `limit`, and `single`
    const mockSingle = jest.fn(() =>
      Promise.resolve({
        data: { id: 'final-match-123', round: 5 },
        error: null,
      })
    );
    const mockLimit = jest.fn(() => ({ single: mockSingle }));
    const mockOrder = jest.fn(() => ({ limit: mockLimit }));
    const mockEq = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase.from = mockFrom;

    const result = await getTournamentFinalMatch('tournament-123');

    expect(mockFrom).toHaveBeenCalledWith('singleEliminationMatches');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('tournament_id', 'tournament-123');
    expect(mockOrder).toHaveBeenCalledWith('round', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockSingle).toHaveBeenCalled();

    expect(result).toEqual({ finalMatch: { id: 'final-match-123', round: 5 } });
  });

  it('should return an error message if there is an error retrieving data', async () => {
    mockSupabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: 'Failed to fetch final match' },
                })
              ),
            })),
          })),
        })),
      })),
    }));

    const result = await getTournamentFinalMatch('tournament-123');

    expect(result).toEqual({ error: 'Failed to fetch final match' });
  });

  it('should handle cases where no match data is found', async () => {
    mockSupabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: null,
                  error: null,
                })
              ),
            })),
          })),
        })),
      })),
    }));

    const result = await getTournamentFinalMatch('tournament-123');

    expect(result).toEqual({ finalMatch: null });
  });
});

describe('submitMatchResult', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    // getTournamentFinalMatch: jest.fn(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn(),
  };
  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when match update fails', async () => {
    mockSupabase
      .update()
      .eq.mockResolvedValueOnce({ error: { message: 'Update failed' } });

    const result = await submitMatchResult('tournament1', 'match1', 'player1');

    expect(result).toEqual({ error: 'Failed to submit match result' });
  });
});
