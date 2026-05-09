export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      analyses: {
        Row: {
          conclusion: string | null;
          created_at: string;
          created_by: string | null;
          date_prelevement: string | null;
          id: string;
          interpretation: string | null;
          interpretation_at: string | null;
          interpretation_par: string | null;
          numero: string | null;
          observation: string | null;
          patient_id: string;
          resultats: Json;
          statut: Database["public"]["Enums"]["statut_analyse"];
          type_prelevement_id: string;
          unite_id: string;
          updated_at: string;
          valide_chef_at: string | null;
          valide_chef_par: string | null;
          valide_unite_at: string | null;
          valide_unite_par: string | null;
          verifie_at: string | null;
          verifie_par: string | null;
        };
        Insert: {
          conclusion?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_prelevement?: string | null;
          id?: string;
          interpretation?: string | null;
          interpretation_at?: string | null;
          interpretation_par?: string | null;
          numero?: string | null;
          observation?: string | null;
          patient_id: string;
          resultats?: Json;
          statut?: Database["public"]["Enums"]["statut_analyse"];
          type_prelevement_id: string;
          unite_id: string;
          updated_at?: string;
          valide_chef_at?: string | null;
          valide_chef_par?: string | null;
          valide_unite_at?: string | null;
          valide_unite_par?: string | null;
          verifie_at?: string | null;
          verifie_par?: string | null;
        };
        Update: {
          conclusion?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_prelevement?: string | null;
          id?: string;
          interpretation?: string | null;
          interpretation_at?: string | null;
          interpretation_par?: string | null;
          numero?: string | null;
          observation?: string | null;
          patient_id?: string;
          resultats?: Json;
          statut?: Database["public"]["Enums"]["statut_analyse"];
          type_prelevement_id?: string;
          unite_id?: string;
          updated_at?: string;
          valide_chef_at?: string | null;
          valide_chef_par?: string | null;
          valide_unite_at?: string | null;
          valide_unite_par?: string | null;
          verifie_at?: string | null;
          verifie_par?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_type_prelevement_id_fkey";
            columns: ["type_prelevement_id"];
            isOneToOne: false;
            referencedRelation: "types_prelevement";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_unite_id_fkey";
            columns: ["unite_id"];
            isOneToOne: false;
            referencedRelation: "unites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_valide_chef_par_fkey";
            columns: ["valide_chef_par"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_valide_unite_par_fkey";
            columns: ["valide_unite_par"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_verifie_par_fkey";
            columns: ["verifie_par"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
        ];
      };
      analyses_historique: {
        Row: {
          acteur_id: string | null;
          analyse_id: string;
          commentaire: string | null;
          created_at: string;
          event: Database["public"]["Enums"]["event_analyse"];
          id: string;
          statut_apres: Database["public"]["Enums"]["statut_analyse"] | null;
          statut_avant: Database["public"]["Enums"]["statut_analyse"] | null;
        };
        Insert: {
          acteur_id?: string | null;
          analyse_id: string;
          commentaire?: string | null;
          created_at?: string;
          event: Database["public"]["Enums"]["event_analyse"];
          id?: string;
          statut_apres?: Database["public"]["Enums"]["statut_analyse"] | null;
          statut_avant?: Database["public"]["Enums"]["statut_analyse"] | null;
        };
        Update: {
          acteur_id?: string | null;
          analyse_id?: string;
          commentaire?: string | null;
          created_at?: string;
          event?: Database["public"]["Enums"]["event_analyse"];
          id?: string;
          statut_apres?: Database["public"]["Enums"]["statut_analyse"] | null;
          statut_avant?: Database["public"]["Enums"]["statut_analyse"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_historique_acteur_id_fkey";
            columns: ["acteur_id"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analyses_historique_analyse_id_fkey";
            columns: ["analyse_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          analyse_id: string | null;
          created_at: string;
          destinataire: string;
          id: string;
          lue_at: string | null;
          message: string | null;
          titre: string;
          type: string;
        };
        Insert: {
          analyse_id?: string | null;
          created_at?: string;
          destinataire: string;
          id?: string;
          lue_at?: string | null;
          message?: string | null;
          titre: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "notifications_analyse_id_fkey";
            columns: ["analyse_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_destinataire_fkey";
            columns: ["destinataire"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          created_at: string;
          created_by: string | null;
          date_naissance: string | null;
          id: string;
          ini: string;
          nom: string;
          prenom: string;
          sexe: string | null;
          unite_id: string;
          updated_at: string;
          ville_naissance: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          date_naissance?: string | null;
          id?: string;
          ini: string;
          nom: string;
          prenom: string;
          sexe?: string | null;
          unite_id: string;
          updated_at?: string;
          ville_naissance?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          date_naissance?: string | null;
          id?: string;
          ini?: string;
          nom?: string;
          prenom?: string;
          sexe?: string | null;
          unite_id?: string;
          updated_at?: string;
          ville_naissance?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "personnel";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patients_unite_id_fkey";
            columns: ["unite_id"];
            isOneToOne: false;
            referencedRelation: "unites";
            referencedColumns: ["id"];
          },
        ];
      };
      personnel: {
        Row: {
          actif: boolean;
          created_at: string;
          email: string;
          id: string;
          nom: string;
          prenom: string;
          role: Database["public"]["Enums"]["role_personnel"];
          unite_id: string | null;
          updated_at: string;
        };
        Insert: {
          actif?: boolean;
          created_at?: string;
          email: string;
          id: string;
          nom: string;
          prenom: string;
          role: Database["public"]["Enums"]["role_personnel"];
          unite_id?: string | null;
          updated_at?: string;
        };
        Update: {
          actif?: boolean;
          created_at?: string;
          email?: string;
          id?: string;
          nom?: string;
          prenom?: string;
          role?: Database["public"]["Enums"]["role_personnel"];
          unite_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "personnel_unite_id_fkey";
            columns: ["unite_id"];
            isOneToOne: false;
            referencedRelation: "unites";
            referencedColumns: ["id"];
          },
        ];
      };
      types_prelevement: {
        Row: { actif: boolean; created_at: string; id: string; nom: string };
        Insert: {
          actif?: boolean;
          created_at?: string;
          id?: string;
          nom: string;
        };
        Update: {
          actif?: boolean;
          created_at?: string;
          id?: string;
          nom?: string;
        };
        Relationships: [];
      };
      unites: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          nom: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          nom: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          nom?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      event_analyse:
        | "creation"
        | "soumission_unite"
        | "verification_resident"
        | "validation_responsable"
        | "validation_chef"
        | "rejet"
        | "modification";
      role_personnel:
        | "secretaire"
        | "resident"
        | "chef_unite"
        | "chef_service";
      statut_analyse:
        | "brouillon"
        | "attente_unite"
        | "attente_chef"
        | "valide";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Personnel = Database["public"]["Tables"]["personnel"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Analyse = Database["public"]["Tables"]["analyses"]["Row"];
export type Unite = Database["public"]["Tables"]["unites"]["Row"];
export type TypePrelevement =
  Database["public"]["Tables"]["types_prelevement"]["Row"];
export type AnalyseHistorique =
  Database["public"]["Tables"]["analyses_historique"]["Row"];
export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];

export type RolePersonnel = Database["public"]["Enums"]["role_personnel"];
export type StatutAnalyse = Database["public"]["Enums"]["statut_analyse"];
