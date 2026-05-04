export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      analyses: {
        Row: {
          conclusion: string | null;
          created_at: string;
          created_by: string | null;
          date_prelevement: string | null;
          id: string;
          numero: string | null;
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
          numero?: string | null;
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
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>;
        Relationships: [];
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
        Update: Partial<Database["public"]["Tables"]["analyses_historique"]["Insert"]>;
        Relationships: [];
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
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: [];
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
        Update: Partial<Database["public"]["Tables"]["personnel"]["Insert"]>;
        Relationships: [];
      };
      types_prelevement: {
        Row: { actif: boolean; created_at: string; id: string; nom: string };
        Insert: { actif?: boolean; created_at?: string; id?: string; nom: string };
        Update: Partial<Database["public"]["Tables"]["types_prelevement"]["Insert"]>;
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
        Update: Partial<Database["public"]["Tables"]["unites"]["Insert"]>;
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
        | "responsable_unite"
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
export type TypePrelevement = Database["public"]["Tables"]["types_prelevement"]["Row"];
export type AnalyseHistorique =
  Database["public"]["Tables"]["analyses_historique"]["Row"];

export type RolePersonnel = Database["public"]["Enums"]["role_personnel"];
export type StatutAnalyse = Database["public"]["Enums"]["statut_analyse"];
