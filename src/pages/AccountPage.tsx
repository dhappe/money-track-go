
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { LogOut, User, Mail } from 'lucide-react';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie seus dados e preferências</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 border border-border rounded-md">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{user.name || 'Usuário'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-md">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferências do aplicativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Novas opções de personalização serão adicionadas em breve.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sobre o aplicativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">MeuBolso</h3>
            <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
          </div>
          <p className="text-sm">
            Um aplicativo para ajudar você a controlar suas finanças pessoais de forma
            simples e eficiente.
          </p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>
    </div>
  );
};

export default AccountPage;
