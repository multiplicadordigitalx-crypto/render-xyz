import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AppUser } from "../types";

/**
 * Validação Matemática de CPF (Algoritmo oficial)
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

  const calculateDigit = (slice: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * (factor - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calculateDigit(cleanCPF.slice(0, 9), 10);
  const digit2 = calculateDigit(cleanCPF.slice(0, 10), 11);

  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
};

/**
 * Máscara de CPF para exibição (LGPD/Segurança)
 */
export const maskCPF = (cpf: string): string => {
  const clean = cpf.replace(/[^\d]/g, '');
  if (clean.length !== 11) return cpf;
  return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
};

export const authService = {
  /**
   * Cadastro no Firebase + Perfil no Firestore
   */
  register: async (data: { name: string; email: string; cpf: string; password: string }): Promise<AppUser> => {
    // Validação de CPF
    if (!validateCPF(data.cpf)) {
      throw new Error("O CPF informado é inválido matematicamente.");
    }

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // 2. Criar perfil no Firestore
      const appUser: AppUser = {
        id: firebaseUser.uid,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        credits: 3,
        plan: 'Essencial',
        joinedAt: Date.now(),
        role: 'user'
      };

      await setDoc(doc(db, "users", firebaseUser.uid), appUser);

      return appUser;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Este e-mail já está em uso.");
      }
      throw new Error(error.message || "Erro ao realizar cadastro.");
    }
  },

  /**
   * Login no Firebase + Busca de perfil no Firestore
   */
  login: async (email: string, password: string): Promise<AppUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Buscar dados extras no Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Perfil de usuário não encontrado.");
      }

      return userDoc.data() as AppUser;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error("Credenciais inválidas. Verifique seus dados e tente novamente.");
      }
      throw new Error(error.message || "Erro ao realizar login.");
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  /**
   * Recuperação de senha
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  }
};
