import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
import { setTokens } from '../services/api';

export function useLoginUser() {
    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            // Intentar login estándar (FormData)
            return authApi.login(email, password);
        },
        onSuccess: (data) => {
            setTokens(data.access_token, data.refresh_token);
        },
    });
}

export function useLoginUserJson() {
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.loginJson(email, password),
        onSuccess: (data) => {
            setTokens(data.access_token, data.refresh_token);
        },
    });
}

export function useRegisterUser() {
    return useMutation({
        mutationFn: authApi.register,
    });
}
