# Personnaliser les e-mails Supabase (anti-spam + branding)

Par défaut, Supabase envoie les invitations depuis `noreply@mail.app.supabase.io`.
Résultat :

- Le mail tombe souvent en **spam** (le domaine n'est pas le vôtre).
- L'expéditeur n'inspire pas confiance pour la personne invitée.
- Le contenu est générique ("You have been invited").

Voici les **deux étapes** pour rendre les invitations soignées et fiables.

---

## Étape 1 — Personnaliser le HTML du mail (5 minutes)

1. Connectez-vous au [Dashboard Supabase](https://app.supabase.com).
2. Sélectionnez le projet **nexus-25** (`ofwarhaldvuocxqmddyz`).
3. Allez dans **Authentication → Email Templates → Invite user**.
4. **Sujet** : remplacez par
   ```
   Invitation — Service de Toxicologie CHU Constantine
   ```
5. **Message body (HTML)** : copiez-collez l'intégralité de [`invite.html`](./invite.html) qui se trouve dans ce dossier.
6. Cliquez **Save**.

C'est fait. Au prochain envoi, le mail aura :

- Un bandeau olive avec votre logo skull
- Un message d'accueil personnalisé `Bonjour {{ .Data.prenom }}`
- Un bouton "Activer mon compte" qui pointe vers `/auth/accept-invite`
  où l'invité choisira son mot de passe
- Une carte rappelant son identifiant et son rôle
- Un footer institutionnel

> Le redirect vers `/auth/accept-invite` est déjà câblé côté code (server action
> `inviteMember`). Aucun changement à faire dans le dashboard pour le redirect.

---

## Étape 2 — Configurer un SMTP custom (15 minutes, **recommandé**)

Tant que les mails sont envoyés depuis le SMTP partagé de Supabase, ils
risqueront de finir en spam. Pour résoudre durablement le problème, il faut
configurer un **SMTP avec votre propre domaine**, par exemple
`noreply@toxicologie-chuc.dz`.

### Option recommandée : Resend (gratuit jusqu'à 3 000 mails/mois)

1. Créez un compte sur [resend.com](https://resend.com) (gratuit).
2. Ajoutez votre domaine (ex. `toxicologie-chuc.dz`) :
   Dashboard Resend → **Domains** → **Add Domain**.
3. Ajoutez les **enregistrements DNS** indiqués (SPF + DKIM + DMARC) chez votre
   hébergeur DNS. Cela authentifie votre domaine — c'est ce qui fait sortir vos
   mails des spams.
4. Vérifiez le domaine dans Resend (bouton "Verify").
5. Récupérez les identifiants SMTP : Resend → **SMTP** → notez `host`, `port`, `username`, `password`.
6. Dans Supabase : **Project Settings → Auth → SMTP Settings**.
   - **Enable Custom SMTP** : ON
   - **Sender email** : `noreply@toxicologie-chuc.dz` (ou ce que vous voulez)
   - **Sender name** : `Service de Toxicologie — CHU Constantine`
   - **Host / Port / Username / Password** : copiez depuis Resend
7. **Save**.

Désormais les invitations partent depuis votre domaine, signées
SPF/DKIM/DMARC. Les filtres anti-spam les acceptent quasi systématiquement.

### Alternatives à Resend

- **SendGrid** (gratuit jusqu'à 100/jour)
- **Postmark** (payant mais excellente délivrabilité)
- **Amazon SES** (très peu cher, plus complexe à configurer)

---

## Test

Après les deux étapes, depuis l'app :

1. Connectez-vous en tant que Chef de Service
2. Allez dans **Administration → Inviter un membre**
3. Saisissez votre propre adresse perso pour tester
4. Vérifiez :
   - L'expéditeur est bien votre domaine
   - Le visuel olive avec logo apparaît
   - Le mail arrive en boîte de réception (pas en spam)
   - Le bouton "Activer mon compte" mène à `/auth/accept-invite`
   - Vous pouvez choisir un mot de passe et accéder au dashboard

---

## Que faire en attendant la configuration SMTP ?

En attendant, dites simplement à chaque nouveau membre invité :

> "Si tu n'as pas reçu le mail dans ta boîte de réception, vérifie le dossier
> spams. L'expéditeur est `noreply@mail.app.supabase.io`."

Une fois Resend configuré, ce conseil ne sera plus nécessaire.
