'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/app';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      if (isSignUp) {
        initiateEmailSignUp(auth, values.email, values.password);
        toast({
          title: 'Verifique seu e-mail',
          description: 'Enviamos um link de verificação para o seu e-mail.',
        });
      } else {
        initiateEmailSignIn(auth, values.email, values.password);
      }
    } catch (error) {
      console.error(error);
      const firebaseError = error as FirebaseError;
      let description = 'Ocorreu um erro. Tente novamente.';
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        description = 'E-mail ou senha inválidos.';
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        description = 'Este e-mail já está em uso.';
      }
      toast({
        variant: 'destructive',
        title: `Falha na ${isSignUp ? 'criação de conta' : 'autenticação'}`,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto animate-fade-in">
      <div className="absolute inset-0 bg-card rounded-xl border border-primary/30 animate-[scan-glow_4s_ease-in-out_infinite] blur-sm"></div>
      <div className="relative overflow-hidden bg-card rounded-xl border border-primary/50 shadow-2xl shadow-primary/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-[scan-line-anim_3s_linear_infinite]"></div>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">Acesso ao Sistema</h2>
          <p className="text-muted-foreground text-center mb-8">Bem-vindo ao OBD-Pro</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground">
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar agora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
