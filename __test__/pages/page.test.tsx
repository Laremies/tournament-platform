import { signUpAction } from '@/lib/actions'; // Adjust the import to your file's location
import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { headers } from 'next/headers';

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

    // it('should call supabase.auth.signUp with correct parameters', async () => {
    //     const formData = new FormData();
    //     formData.append('username', 'testuser');
    //     formData.append('email', 'test@example.com');
    //     formData.append('password', 'password123');

    //     await signUpAction(formData);

    //     expect(mockSignUp).toHaveBeenCalledWith({
    //         email: 'test@example.com',
    //         password: 'password123',
    //         options: {
    //             data: { username: 'testuser' },
    //             emailRedirectTo: 'http://localhost:3000/auth/callback',
    //         },
    //     });
    // });

    it('should return encoded redirect on successful sign up', async () => {
        mockSignUp.mockResolvedValueOnce({ error: null }); // Successful sign-up mock response

        const formData = new FormData();
        formData.append('username', 'testuser');
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const result = await signUpAction(formData);

        expect(result).toEqual(encodedRedirect(
            'success',
            '/sign-up',
            'Thanks for signing up! Please check your email for a verification link.'
        ));
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

